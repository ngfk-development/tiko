use async_trait::async_trait;
use serde::Serialize;
use serde_json::Value as JsonValue;
use tiko_database::models::{
    AuthType, CustomFieldReadMapping, FieldMappingConfig, FilterRules, Integration, SyncDirection,
    SyncEntity, SyncMapping, SyncTrigger, TemplateWithFormat, TimeEntryReadMapping,
};

use crate::{
    default_mapping::DefaultSyncMapping,
    fields::EntityFields,
    harvest::{HarvestClient, auth::HarvestAuth, entities as e, fields, queries as q},
    provider::{IntegrationProvider, ProviderError, ProviderReferenceEntry, ProviderTimeEntry},
    template,
};

fn parse_auth(integration: &Integration) -> Result<HarvestAuth, ProviderError> {
    fn parse<T: serde::de::DeserializeOwned>(
        integration: &Integration,
        wrap: impl FnOnce(T) -> HarvestAuth,
    ) -> Result<HarvestAuth, ProviderError> {
        serde_json::from_value(integration.auth_data.clone())
            .map(wrap)
            .map_err(|e| ProviderError::InvalidAuthData(e.to_string()))
    }

    match integration.auth_type {
        AuthType::PersonalAccessToken => parse(integration, HarvestAuth::PersonalAccessToken),
        AuthType::Oauth2 => parse(integration, HarvestAuth::Oauth2),
    }
}

#[derive(Clone)]
pub struct HarvestProvider {
    client: HarvestClient,
}

impl HarvestProvider {
    const PER_PAGE: u32 = 50;

    pub fn new(http: reqwest::Client) -> Self {
        HarvestProvider {
            client: HarvestClient::new(http),
        }
    }
}

#[async_trait]
impl IntegrationProvider for HarvestProvider {
    fn entity_fields(&self) -> Vec<EntityFields> {
        vec![
            fields::time_entry(),
            fields::project(),
            fields::task(),
            fields::client(),
        ]
    }

    fn default_sync_mappings(&self) -> Vec<DefaultSyncMapping> {
        vec![DefaultSyncMapping {
            direction: SyncDirection::Read,
            entity: SyncEntity::HarvestTimeEntry,
            trigger: SyncTrigger::Automatic,
            trigger_metadata: serde_json::json!({}),
            filter_rules: FilterRules { conditions: vec![] },
            field_mappings: FieldMappingConfig::TimeEntryRead(TimeEntryReadMapping {
                started_at: TemplateWithFormat {
                    template: "{spent_date} {started_time}".to_string(),
                    format: "%Y-%m-%d %I:%M%P".to_string(),
                },
                ended_at: Some(TemplateWithFormat {
                    template: "{spent_date} {ended_time}".to_string(),
                    format: "%Y-%m-%d %I:%M%P".to_string(),
                }),
                description: Some("{notes}".to_string()),
                billable: Some("billable".to_string()),
                custom_field_links: vec![],
            }),
        }]
    }

    async fn read_time_entries(
        &self,
        integration: &Integration,
        mapping: &SyncMapping,
    ) -> Result<Vec<ProviderTimeEntry>, ProviderError> {
        let auth = parse_auth(integration)?;

        let FieldMappingConfig::TimeEntryRead(field_mapping) = &*mapping.field_mappings else {
            return Err(ProviderError::InvalidMapping(
                "Harvest time entry reads require a TimeEntryRead field mapping".to_string(),
            ));
        };

        let query = q::time_entries::ListTimeEntriesQuery {
            updated_since: mapping.last_synced_at,
            per_page: Some(HarvestProvider::PER_PAGE),
            ..Default::default()
        };

        let entries = self
            .client
            .list_time_entries(&auth, query)
            .await
            .map_err(|e| ProviderError::RequestFailed(e.to_string()))?;

        entries
            .into_iter()
            .map(|entry| to_time_entry(entry, field_mapping))
            .collect()
    }

    async fn read_reference_entries(
        &self,
        integration: &Integration,
        mapping: &SyncMapping,
    ) -> Result<Vec<ProviderReferenceEntry>, ProviderError> {
        let auth = parse_auth(integration)?;

        let FieldMappingConfig::CustomFieldRead(field_mapping) = &*mapping.field_mappings else {
            return Err(ProviderError::InvalidMapping(
                "Harvest reference reads require a CustomFieldRead field mapping".to_string(),
            ));
        };

        match mapping.entity {
            SyncEntity::HarvestClient => {
                let query = q::clients::ListClientsQuery {
                    updated_since: mapping.last_synced_at,
                    per_page: Some(HarvestProvider::PER_PAGE),
                    ..Default::default()
                };

                let clients = self
                    .client
                    .list_clients(&auth, query)
                    .await
                    .map_err(|e| ProviderError::RequestFailed(e.to_string()))?;

                clients
                    .into_iter()
                    .map(|client| to_ref_entry(SyncEntity::HarvestClient, client, field_mapping))
                    .collect()
            }
            SyncEntity::HarvestProject => {
                let query = q::projects::ListProjectsQuery {
                    updated_since: mapping.last_synced_at,
                    per_page: Some(HarvestProvider::PER_PAGE),
                    ..Default::default()
                };

                let projects = self
                    .client
                    .list_projects(&auth, query)
                    .await
                    .map_err(|e| ProviderError::RequestFailed(e.to_string()))?;

                projects
                    .into_iter()
                    .map(|project| to_ref_entry(SyncEntity::HarvestProject, project, field_mapping))
                    .collect()
            }
            other => Err(ProviderError::InvalidMapping(format!(
                "Harvest reference reads not yet implemented for {other:?}"
            ))),
        }
    }
}

fn to_time_entry(
    entry: e::time_entry::HarvestTimeEntry,
    mapping: &TimeEntryReadMapping,
) -> Result<ProviderTimeEntry, ProviderError> {
    let raw =
        serde_json::to_value(&entry).map_err(|e| ProviderError::RequestFailed(e.to_string()))?;

    let fields = template::derive_time_entry_fields(mapping, &raw)?;

    Ok(ProviderTimeEntry {
        entity: SyncEntity::HarvestTimeEntry,
        external_id: entry.id.to_string(),
        time_started: fields.time_started,
        time_ended: fields.time_ended,
        description: fields.description,
        billable: fields.billable,
        raw,
    })
}

fn to_ref_entry<T: Serialize>(
    entity: SyncEntity,
    item: T,
    mapping: &CustomFieldReadMapping,
) -> Result<ProviderReferenceEntry, ProviderError> {
    let raw =
        serde_json::to_value(&item).map_err(|e| ProviderError::RequestFailed(e.to_string()))?;

    let external_id = raw
        .get("id")
        .and_then(JsonValue::as_u64)
        .ok_or_else(|| {
            ProviderError::RequestFailed("entity JSON has no numeric id field".to_string())
        })?
        .to_string();

    let fields = template::derive_custom_field_fields(mapping, &raw);

    Ok(ProviderReferenceEntry {
        entity,
        external_id,
        label: fields.label,
        key: fields.key,
        metadata: fields.metadata,
        raw,
    })
}
