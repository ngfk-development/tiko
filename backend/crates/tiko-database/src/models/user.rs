use sqlx::types::chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(sqlx::FromRow, Debug)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub email_verified: bool,
    pub first_name: String,
    pub last_name: String,
    pub password_hash: String,
    pub admin: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
