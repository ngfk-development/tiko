use async_trait::async_trait;
use tiko_database::models::{Integration, SyncMapping};

use crate::{
    default_mapping::DefaultSyncMapping,
    fields::EntityFields,
    provider::{IntegrationProvider, ProviderError, ProviderReferenceEntry, ProviderTimeEntry},
};

#[derive(Clone)]
pub struct SimplicateProvider;

#[async_trait]
impl IntegrationProvider for SimplicateProvider {
    fn entity_fields(&self) -> Vec<EntityFields> {
        vec![]
    }

    fn default_sync_mappings(&self) -> Vec<DefaultSyncMapping> {
        vec![]
    }

    async fn read_time_entries(
        &self,
        _integration: &Integration,
        _mapping: &SyncMapping,
    ) -> Result<Vec<ProviderTimeEntry>, ProviderError> {
        Ok(vec![])
    }

    async fn read_reference_entries(
        &self,
        _integration: &Integration,
        _mapping: &SyncMapping,
    ) -> Result<Vec<ProviderReferenceEntry>, ProviderError> {
        Ok(vec![])
    }
}
