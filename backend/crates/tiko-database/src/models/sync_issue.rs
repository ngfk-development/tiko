use sqlx::types::JsonValue;
use sqlx::types::chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(sqlx::Type, Debug, Clone, Copy, PartialEq)]
#[sqlx(type_name = "sync_issue_status", rename_all = "snake_case")]
pub enum SyncIssueStatus {
    Open,
    Resolved,
    Skipped,
}

#[derive(sqlx::Type, Debug, Clone, Copy, PartialEq)]
#[sqlx(type_name = "sync_issue_kind", rename_all = "snake_case")]
pub enum SyncIssueKind {
    MissingField,
    WriteConflict,
}

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct SyncIssue {
    pub id: Uuid,
    pub integration_id: Uuid,
    pub sync_mapping_id: Option<Uuid>,
    pub time_entry_id: Option<Uuid>,
    pub custom_field_value_id: Option<Uuid>,
    pub status: SyncIssueStatus,
    pub kind: SyncIssueKind,
    pub raw_data: JsonValue,
    pub context: Option<JsonValue>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}
