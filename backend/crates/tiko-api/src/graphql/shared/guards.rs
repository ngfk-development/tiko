use async_graphql::{Context, Error as GqlError, ErrorExtensions, Guard, Result};
use uuid::Uuid;

use crate::{auth::CurrentUser, graphql::GraphQLContext};

pub enum AuthError {
    Unauthenticated,
    Forbidden,
    InvalidCredentials,
}

impl From<AuthError> for GqlError {
    fn from(err: AuthError) -> Self {
        let (message, code) = match err {
            AuthError::Unauthenticated => ("not authenticated", "UNAUTHENTICATED"),
            AuthError::Forbidden => ("forbidden", "FORBIDDEN"),
            AuthError::InvalidCredentials => ("invalid credentials", "INVALID_CREDENTIALS"),
        };

        GqlError::new(message).extend_with(|_, e| e.set("code", code))
    }
}

pub fn current_user<'ctx>(ctx: &Context<'ctx>) -> Result<&'ctx CurrentUser> {
    ctx.data::<Option<CurrentUser>>()?
        .as_ref()
        .ok_or_else(|| AuthError::Unauthenticated.into())
}

pub struct AuthGuard;

impl Guard for AuthGuard {
    async fn check(&self, ctx: &Context<'_>) -> Result<()> {
        current_user(ctx)?;
        Ok(())
    }
}

pub struct AdminGuard;

impl Guard for AdminGuard {
    async fn check(&self, ctx: &Context<'_>) -> Result<()> {
        let user = current_user(ctx)?;
        let context = ctx.data::<GraphQLContext>()?;

        let requester = context
            .users
            .find_by_id(user.user_id)
            .await?
            .ok_or(AuthError::Unauthenticated)?;

        if !requester.admin {
            return Err(AuthError::Forbidden.into());
        }

        Ok(())
    }
}

pub struct SelfGuard {
    user_id: Uuid,
}

impl SelfGuard {
    pub fn new(user_id: Uuid) -> Self {
        SelfGuard { user_id }
    }
}

impl Guard for SelfGuard {
    async fn check(&self, ctx: &Context<'_>) -> Result<()> {
        let requester = current_user(ctx)?;

        if requester.user_id == self.user_id {
            Ok(())
        } else {
            Err(AuthError::Forbidden.into())
        }
    }
}
