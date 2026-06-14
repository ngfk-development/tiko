use async_graphql::SimpleObject;
use tiko_providers::{EntityFields as DomainEntityFields, Field as DomainField};

use super::enums::{FieldType, SyncEntity};
use crate::graphql::integrations::Provider;

#[derive(SimpleObject)]
pub struct Field {
    pub key: String,
    pub field_type: FieldType,
    pub example: String,
}

impl From<DomainField> for Field {
    fn from(field: DomainField) -> Self {
        Field {
            key: field.key,
            field_type: field.field_type.into(),
            example: field.example,
        }
    }
}

#[derive(SimpleObject)]
pub struct EntityFields {
    pub entity: SyncEntity,
    pub is_time_entry: bool,
    pub fields: Vec<Field>,
}

impl From<DomainEntityFields> for EntityFields {
    fn from(entity_fields: DomainEntityFields) -> Self {
        EntityFields {
            entity: entity_fields.entity.into(),
            is_time_entry: entity_fields.is_time_entry,
            fields: entity_fields.fields.into_iter().map(Field::from).collect(),
        }
    }
}

pub fn entity_fields(provider: Provider, http: reqwest::Client) -> Vec<EntityFields> {
    tiko_providers::provider_for(provider.into(), http)
        .entity_fields()
        .into_iter()
        .map(EntityFields::from)
        .collect()
}
