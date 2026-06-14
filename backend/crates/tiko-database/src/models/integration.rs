use sqlx::types::JsonValue;
use sqlx::types::chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(sqlx::Type, serde::Serialize, Debug, Clone, PartialEq)]
#[sqlx(type_name = "provider", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum Provider {
    Harvest,
    Moneybird,
    Simplicate,
}

#[derive(sqlx::Type, Debug, Clone, PartialEq)]
#[sqlx(type_name = "auth_type", rename_all = "snake_case")]
pub enum AuthType {
    PersonalAccessToken,
    Oauth2,
}

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct Integration {
    pub id: Uuid,
    pub user_id: Uuid,
    pub provider: Provider,
    pub auth_type: AuthType,
    pub auth_data: JsonValue,
    pub token_expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
