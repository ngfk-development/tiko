use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde_json::Value as JsonValue;
use tiko_database::models::{Integration, SyncEntity, SyncMapping};

use crate::{default_mapping::DefaultSyncMapping, fields::EntityFields};

#[derive(Debug)]
pub struct ProviderTimeEntry {
    pub entity: SyncEntity,
    pub external_id: String,
    pub time_started: DateTime<Utc>,
    pub time_ended: Option<DateTime<Utc>>,
    pub description: Option<String>,
    pub billable: bool,
    pub raw: JsonValue,
}

#[derive(Debug)]
pub struct ProviderReferenceEntry {
    pub entity: SyncEntity,
    pub external_id: String,
    pub label: Option<String>,
    pub key: Option<String>,
    pub metadata: JsonValue,
    pub raw: JsonValue,
}

#[derive(thiserror::Error, Debug)]
pub enum ProviderError {
    #[error("missing or invalid auth data: {0}")]
    InvalidAuthData(String),

    #[error("provider request failed: {0}")]
    RequestFailed(String),

    #[error("invalid sync mapping: {0}")]
    InvalidMapping(String),
}

#[async_trait]
pub trait IntegrationProvider: Send + Sync {
    fn entity_fields(&self) -> Vec<EntityFields>;

    fn default_sync_mappings(&self) -> Vec<DefaultSyncMapping>;

    async fn read_time_entries(
        &self,
        integration: &Integration,
        mapping: &SyncMapping,
    ) -> Result<Vec<ProviderTimeEntry>, ProviderError>;

    async fn read_reference_entries(
        &self,
        integration: &Integration,
        mapping: &SyncMapping,
    ) -> Result<Vec<ProviderReferenceEntry>, ProviderError>;
}
