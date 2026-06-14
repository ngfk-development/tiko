use sqlx::types::JsonValue;
use sqlx::types::chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(sqlx::Type, Debug, Clone, Copy, PartialEq)]
#[sqlx(type_name = "job_status", rename_all = "snake_case")]
pub enum JobStatus {
    Pending,
    Processing,
    Done,
    Failed,
}

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct SyncJob {
    pub id: Uuid,
    pub sync_record_id: Uuid,
    pub mapping_id: Uuid,
    pub patch: JsonValue,
    pub status: JobStatus,
    pub attempts: i32,
    pub last_error: Option<String>,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
