use axum::http::HeaderMap;
use uuid::Uuid;

use crate::auth::JwtIssuer;

#[derive(Clone)]
pub struct CurrentUser {
    pub user_id: Uuid,
}

impl CurrentUser {
    pub fn from_headers(headers: &HeaderMap, jwt: &JwtIssuer) -> Option<Self> {
        let token = headers
            .get("authorization")
            .and_then(|value| value.to_str().ok())
            .and_then(|value| value.strip_prefix("Bearer "))?;

        Self::from_token(token, jwt)
    }

    pub fn from_token(token: &str, jwt: &JwtIssuer) -> Option<Self> {
        let claims = jwt.verify(token).ok()?;

        Some(CurrentUser {
            user_id: claims.sub,
        })
    }
}
