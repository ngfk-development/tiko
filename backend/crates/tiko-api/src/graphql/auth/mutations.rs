use std::net::SocketAddr;

use async_graphql::{Context, Object, Result, SimpleObject};
use axum::http::{HeaderMap, header::SET_COOKIE};
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use chrono::{Duration, Utc};

use crate::config::{
    ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_TTL_MINUTES, REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_TTL_DAYS,
};
use crate::graphql::auth::AuthMode;
use crate::graphql::shared::context::GraphQLContext;
use crate::graphql::shared::guards::AuthError;

#[derive(Clone)]
pub struct RequestMeta {
    addr: SocketAddr,
    user_agent: Option<String>,
}

impl RequestMeta {
    pub fn from_headers(addr: SocketAddr, headers: &HeaderMap) -> Self {
        let user_agent = headers
            .get("user-agent")
            .and_then(|value| value.to_str().ok())
            .map(|value| value.to_string());

        RequestMeta { addr, user_agent }
    }
}

fn auth_cookie(name: &'static str, value: String, max_age: time::Duration) -> Cookie<'static> {
    Cookie::build((name, value))
        .http_only(true)
        .secure(true)
        .same_site(SameSite::Strict)
        .path("/graphql")
        .max_age(max_age)
        .build()
}

fn refresh_token_cookie(value: String) -> Cookie<'static> {
    auth_cookie(
        REFRESH_TOKEN_COOKIE,
        value,
        time::Duration::days(REFRESH_TOKEN_TTL_DAYS),
    )
}

fn expired_refresh_token_cookie() -> Cookie<'static> {
    auth_cookie(REFRESH_TOKEN_COOKIE, String::new(), time::Duration::ZERO)
}

fn access_token_cookie(value: String) -> Cookie<'static> {
    auth_cookie(
        ACCESS_TOKEN_COOKIE,
        value,
        time::Duration::minutes(ACCESS_TOKEN_TTL_MINUTES),
    )
}

fn expired_access_token_cookie() -> Cookie<'static> {
    auth_cookie(ACCESS_TOKEN_COOKIE, String::new(), time::Duration::ZERO)
}

#[derive(SimpleObject)]
pub struct TokenResponse {
    access_token: String,
    refresh_token: Option<String>,
}

#[derive(Default)]
pub struct AuthMutation;

#[Object]
impl AuthMutation {
    async fn auth_login(
        &self,
        ctx: &Context<'_>,
        email: String,
        password: String,
        #[graphql(default_with = "AuthMode::Cookie")] mode: AuthMode,
    ) -> Result<TokenResponse> {
        let context = ctx.data::<GraphQLContext>()?;
        let meta = ctx.data::<RequestMeta>()?;

        let user = context
            .users
            .verify_credentials(&email, &password)
            .await?
            .ok_or(AuthError::InvalidCredentials)?;

        let access_token = context.jwt.issue(user.id)?;

        let session = context
            .sessions
            .create(
                user.id,
                Utc::now() + Duration::days(REFRESH_TOKEN_TTL_DAYS),
                Some(meta.addr.ip().to_string()),
                meta.user_agent.clone(),
            )
            .await?;

        Ok(deliver_tokens(
            ctx,
            mode,
            access_token,
            session.refresh_token,
        ))
    }

    async fn auth_logout(&self, ctx: &Context<'_>, refresh_token: Option<String>) -> Result<bool> {
        let context = ctx.data::<GraphQLContext>()?;
        let token = refresh_token.or_else(|| incoming_refresh_token(ctx));

        if let Some(token) = token {
            context.sessions.revoke(&token).await?;
        }

        ctx.append_http_header(SET_COOKIE, expired_refresh_token_cookie().to_string());
        ctx.append_http_header(SET_COOKIE, expired_access_token_cookie().to_string());

        Ok(true)
    }

    async fn auth_refresh(
        &self,
        ctx: &Context<'_>,
        refresh_token: Option<String>,
        #[graphql(default_with = "AuthMode::Cookie")] mode: AuthMode,
    ) -> Result<TokenResponse> {
        let context = ctx.data::<GraphQLContext>()?;
        let meta = ctx.data::<RequestMeta>()?;

        let incoming_token = refresh_token
            .or_else(|| incoming_refresh_token(ctx))
            .ok_or(AuthError::Unauthenticated)?;

        let session = context
            .sessions
            .rotate(
                &incoming_token,
                Utc::now() + Duration::days(REFRESH_TOKEN_TTL_DAYS),
                Some(meta.addr.ip().to_string()),
                meta.user_agent.clone(),
            )
            .await?
            .ok_or(AuthError::Unauthenticated)?;

        let access_token = context.jwt.issue(session.user_id)?;

        Ok(deliver_tokens(
            ctx,
            mode,
            access_token,
            session.refresh_token,
        ))
    }
}

fn incoming_refresh_token(ctx: &Context<'_>) -> Option<String> {
    ctx.data::<CookieJar>()
        .ok()?
        .get(REFRESH_TOKEN_COOKIE)
        .map(|cookie| cookie.value().to_string())
}

fn deliver_tokens(
    ctx: &Context<'_>,
    mode: AuthMode,
    access_token: String,
    refresh_token: String,
) -> TokenResponse {
    if mode == AuthMode::Cookie {
        ctx.append_http_header(
            SET_COOKIE,
            access_token_cookie(access_token.clone()).to_string(),
        );
        ctx.append_http_header(
            SET_COOKIE,
            refresh_token_cookie(refresh_token.clone()).to_string(),
        );
    }

    let refresh_token = match mode {
        AuthMode::Cookie => None,
        AuthMode::Json => Some(refresh_token),
    };

    TokenResponse {
        access_token,
        refresh_token,
    }
}
