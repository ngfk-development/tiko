use sqlx::types::JsonValue;
use sqlx::types::chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::models::SyncEntity;

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct SyncRecord {
    pub id: Uuid,
    pub time_entry_id: Option<Uuid>,
    pub custom_field_value_id: Option<Uuid>,
    pub integration_id: Uuid,
    pub entity: SyncEntity,
    pub external_id: Option<String>,
    pub data: JsonValue,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
