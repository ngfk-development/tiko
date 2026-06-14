use serde::{Deserialize, Serialize};
use sqlx::types::chrono::{DateTime, Utc};
use sqlx::types::{Json, JsonValue};
use uuid::Uuid;

use crate::models::{FieldMappingConfig, FilterRules};

#[derive(sqlx::Type, Debug, Clone, Copy, PartialEq)]
#[sqlx(type_name = "sync_direction", rename_all = "snake_case")]
pub enum SyncDirection {
    Read,
    Write,
}

#[derive(sqlx::Type, Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[sqlx(type_name = "sync_entity", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum SyncEntity {
    HarvestTimeEntry,
    HarvestProject,
    HarvestTask,
    HarvestClient,
}

#[derive(sqlx::Type, Debug, Clone, Copy, PartialEq)]
#[sqlx(type_name = "sync_trigger", rename_all = "snake_case")]
pub enum SyncTrigger {
    Automatic,
    Cron,
    Manual,
}

#[derive(sqlx::FromRow, Debug)]
pub struct SyncMapping {
    pub id: Uuid,
    pub integration_id: Uuid,
    pub direction: SyncDirection,
    pub entity: SyncEntity,
    pub trigger: SyncTrigger,
    pub trigger_metadata: JsonValue,
    pub filter_rules: Json<FilterRules>,
    pub field_mappings: Json<FieldMappingConfig>,
    pub active: bool,
    pub sync_state: JsonValue,
    pub last_synced_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
