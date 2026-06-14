use async_graphql::{Context, InputObject, Object, Result};
use tiko_database::models::{
    CustomFieldLink as DbCustomFieldLink, CustomFieldReadMapping as DbCustomFieldReadMapping,
    FieldMappingConfig as DbFieldMappingConfig, Integration as DbIntegration,
    MetadataEntry as DbMetadataEntry, SyncEntity as DbSyncEntity,
    TemplateWithFormat as DbTemplateWithFormat, TimeEntryReadMapping as DbTimeEntryReadMapping,
};
use uuid::Uuid;

use super::enums::{SyncEntity, SyncTrigger};
use super::queries::SyncMapping;
use crate::graphql::shared::{
    context::GraphQLContext,
    errors::ValidationError,
    guards::{AuthGuard, current_user},
};

#[derive(InputObject)]
pub struct TemplateWithFormatInput {
    pub template: String,
    pub format: String,
}

impl From<TemplateWithFormatInput> for DbTemplateWithFormat {
    fn from(input: TemplateWithFormatInput) -> Self {
        DbTemplateWithFormat {
            template: input.template,
            format: input.format,
        }
    }
}

#[derive(InputObject)]
pub struct CustomFieldLinkInput {
    pub custom_field_id: Uuid,
    pub entity: SyncEntity,
    pub external_id_field: String,
}

impl From<CustomFieldLinkInput> for DbCustomFieldLink {
    fn from(input: CustomFieldLinkInput) -> Self {
        DbCustomFieldLink {
            custom_field_id: input.custom_field_id,
            entity: input.entity.into(),
            external_id_field: input.external_id_field,
        }
    }
}

#[derive(InputObject)]
pub struct MetadataEntryInput {
    pub key: String,
    pub template: String,
}

impl From<MetadataEntryInput> for DbMetadataEntry {
    fn from(input: MetadataEntryInput) -> Self {
        DbMetadataEntry {
            key: input.key,
            template: input.template,
        }
    }
}

#[derive(InputObject)]
pub struct TimeEntryReadMappingInput {
    pub started_at: TemplateWithFormatInput,
    pub ended_at: Option<TemplateWithFormatInput>,
    pub description: Option<String>,
    pub billable: Option<String>,
    #[graphql(default)]
    pub custom_field_links: Vec<CustomFieldLinkInput>,
}

impl From<TimeEntryReadMappingInput> for DbTimeEntryReadMapping {
    fn from(input: TimeEntryReadMappingInput) -> Self {
        DbTimeEntryReadMapping {
            started_at: input.started_at.into(),
            ended_at: input.ended_at.map(Into::into),
            description: input.description,
            billable: input.billable,
            custom_field_links: input
                .custom_field_links
                .into_iter()
                .map(Into::into)
                .collect(),
        }
    }
}

#[derive(InputObject)]
pub struct CustomFieldReadMappingInput {
    pub custom_field_id: Uuid,
    pub label: Option<String>,
    pub key: Option<String>,
    #[graphql(default)]
    pub metadata: Vec<MetadataEntryInput>,
}

impl From<CustomFieldReadMappingInput> for DbCustomFieldReadMapping {
    fn from(input: CustomFieldReadMappingInput) -> Self {
        DbCustomFieldReadMapping {
            custom_field_id: input.custom_field_id,
            label: input.label,
            key: input.key,
            metadata: input.metadata.into_iter().map(Into::into).collect(),
        }
    }
}

#[derive(InputObject)]
pub struct CreateSyncMappingInput {
    pub integration_id: Uuid,
    pub entity: SyncEntity,
    pub trigger: SyncTrigger,
    pub time_entry_read: Option<TimeEntryReadMappingInput>,
    pub custom_field_read: Option<CustomFieldReadMappingInput>,
}

#[derive(Default)]
pub struct SyncMappingsMutation;

#[Object]
impl SyncMappingsMutation {
    #[graphql(guard = "AuthGuard")]
    async fn create_sync_mapping(
        &self,
        ctx: &Context<'_>,
        input: CreateSyncMappingInput,
    ) -> Result<SyncMapping> {
        let user_id = current_user(ctx)?.user_id;
        let context = ctx.data::<GraphQLContext>()?;

        let integration = context
            .integrations
            .find(input.integration_id, user_id)
            .await?
            .ok_or_else(|| ValidationError::new("integration not found").field("integrationId"))?;

        let is_time_entry = validate_entity(&integration, input.entity, context.http.clone())?;

        let field_mappings = match (
            is_time_entry,
            input.time_entry_read,
            input.custom_field_read,
        ) {
            (true, Some(time_entry_read), None) => {
                DbFieldMappingConfig::TimeEntryRead(time_entry_read.into())
            }
            (false, None, Some(custom_field_read)) => {
                DbFieldMappingConfig::CustomFieldRead(custom_field_read.into())
            }
            (true, _, _) => {
                return Err(ValidationError::new(
                    "entity is a Time Entry entity — provide timeEntryRead, not customFieldRead",
                )
                .field("entity")
                .into());
            }
            (false, _, _) => {
                return Err(ValidationError::new(
                    "entity is a reference entity — provide customFieldRead, not timeEntryRead",
                )
                .field("entity")
                .into());
            }
        };

        let mapping = context
            .sync_mappings
            .create(
                input.integration_id,
                input.entity.into(),
                input.trigger.into(),
                field_mappings,
            )
            .await?;

        Ok(SyncMapping::from(mapping))
    }
}

fn validate_entity(
    integration: &DbIntegration,
    entity: SyncEntity,
    http: reqwest::Client,
) -> Result<bool> {
    let db_entity: DbSyncEntity = entity.into();

    let matched = tiko_providers::provider_for(integration.provider.clone(), http)
        .entity_fields()
        .into_iter()
        .find(|ef| ef.entity == db_entity)
        .ok_or_else(|| {
            ValidationError::new("entity is not valid for this integration's provider")
                .field("entity")
        })?;

    Ok(matched.is_time_entry)
}
