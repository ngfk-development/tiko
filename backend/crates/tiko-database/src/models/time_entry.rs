use sqlx::types::JsonValue;
use sqlx::types::chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct TimeEntry {
    pub id: Uuid,
    pub user_id: Uuid,
    pub time_started: DateTime<Utc>,
    pub time_ended: Option<DateTime<Utc>>,
    pub description: Option<String>,
    pub billable: bool,
    pub custom_fields: JsonValue,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
