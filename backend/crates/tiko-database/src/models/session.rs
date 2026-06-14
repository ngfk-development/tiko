use sqlx::types::chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(sqlx::FromRow, Debug)]
pub struct Session {
    pub id: Uuid,
    pub user_id: Uuid,
    pub refresh_token: String,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
