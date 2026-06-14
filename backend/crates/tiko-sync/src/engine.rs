use chrono::Utc;
use std::time::Duration;
use tiko_database::{
    database::Database,
    models::{FieldMappingConfig, SyncMapping},
};
use tiko_providers::{ProviderError, derive_time_entry_fields};
use tokio::{spawn, time::sleep};

use crate::{error::SyncError, repositories::SyncRepository};

#[derive(Clone)]
pub struct SyncEngine {
    sync: SyncRepository,
    http: reqwest::Client,
}

impl SyncEngine {
    pub fn new(database: Database) -> Self {
        SyncEngine {
            sync: SyncRepository::new(database),
            http: reqwest::Client::new(),
        }
    }

    pub async fn run(&self) -> Result<(), SyncError> {
        loop {
            self.tick().await?;
            sleep(Duration::from_secs(60)).await;
        }
    }

    async fn tick(&self) -> Result<(), SyncError> {
        let mappings = self.sync.find_active_reads().await?;

        let count = mappings.len();
        let stagger_ms = 0 / count.max(1);

        tracing::trace!("tick: found {} active read mapping(s)", count);

        for mapping in mappings {
            let engine = self.clone();

            spawn(async move {
                let mapping_id = mapping.id;
                if let Err(e) = engine.process_read_mapping(mapping).await {
                    tracing::error!("Read mapping {} failed: {}", mapping_id, e);
                }
            });

            sleep(Duration::from_millis(stagger_ms as u64)).await;
        }

        Ok(())
    }

    async fn process_read_mapping(&self, mapping: SyncMapping) -> Result<(), SyncError> {
        match &*mapping.field_mappings {
            FieldMappingConfig::TimeEntryRead(_) => self.process_time_entries(mapping).await,
            FieldMappingConfig::CustomFieldRead(_) => self.process_reference_entries(mapping).await,
        }
    }

    async fn process_time_entries(&self, mapping: SyncMapping) -> Result<(), SyncError> {
        let integration = self.sync.get_integration(mapping.integration_id).await?;
        let provider =
            tiko_providers::provider_for(integration.provider.clone(), self.http.clone());

        let request_started_at = Utc::now();
        let entries = provider.read_time_entries(&integration, &mapping).await?;

        tracing::trace!(
            mapping_id = %mapping.id,
            entry_count = entries.len(),
            "process_time_entries: fetched entries"
        );

        for entry in entries {
            self.sync.process_entry(&integration, entry).await?;
        }

        self.sync
            .mark_mapping_synced(mapping.id, request_started_at)
            .await?;

        Ok(())
    }

    async fn process_reference_entries(&self, mapping: SyncMapping) -> Result<(), SyncError> {
        let integration = self.sync.get_integration(mapping.integration_id).await?;
        let provider =
            tiko_providers::provider_for(integration.provider.clone(), self.http.clone());

        let FieldMappingConfig::CustomFieldRead(field_mapping) = &*mapping.field_mappings else {
            return Err(SyncError::Provider(ProviderError::InvalidMapping(
                "expected a CustomFieldRead mapping".to_string(),
            )));
        };
        let custom_field_id = field_mapping.custom_field_id;

        let request_started_at = Utc::now();
        let entries = provider
            .read_reference_entries(&integration, &mapping)
            .await?;

        tracing::trace!(
            mapping_id = %mapping.id,
            entry_count = entries.len(),
            "process_reference_entries: fetched entries"
        );

        for entry in entries {
            self.sync
                .process_reference_entry(&integration, custom_field_id, entry)
                .await?;
        }

        self.sync
            .mark_mapping_synced(mapping.id, request_started_at)
            .await?;

        Ok(())
    }

    /// Re-derives fields for every already-synced record under `mapping`, straight from the raw
    /// data already stored in `sync_records` — no provider re-fetch needed, since the mapping's
    /// `field_mappings` is the only thing that changed. Returns how many rows actually changed.
    /// Explicit/opt-in only: never runs automatically when a mapping is edited.
    pub async fn reapply_mapping(&self, mapping: &SyncMapping) -> Result<u64, SyncError> {
        let FieldMappingConfig::TimeEntryRead(field_mapping) = &*mapping.field_mappings else {
            return Err(SyncError::Provider(ProviderError::InvalidMapping(
                "reapply is only supported for TimeEntryRead mappings".to_string(),
            )));
        };

        let records = self
            .sync
            .find_synced_time_entry_records(mapping.integration_id, mapping.entity)
            .await?;

        let mut updated = 0u64;

        for record in records {
            let Some(time_entry_id) = record.time_entry_id else {
                continue;
            };

            let fields = derive_time_entry_fields(field_mapping, &record.data)?;

            if self
                .sync
                .update_time_entry_derived_fields(time_entry_id, &fields)
                .await?
                .is_some()
            {
                updated += 1;
            }
        }

        Ok(updated)
    }
}
