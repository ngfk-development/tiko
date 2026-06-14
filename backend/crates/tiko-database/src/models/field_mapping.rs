use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::SyncEntity;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum FieldMappingConfig {
    TimeEntryRead(TimeEntryReadMapping),
    CustomFieldRead(CustomFieldReadMapping),
}

pub type Template = String;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TemplateWithFormat {
    pub template: Template,
    pub format: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TimeEntryReadMapping {
    pub started_at: TemplateWithFormat,
    pub ended_at: Option<TemplateWithFormat>,
    pub description: Option<Template>,
    pub billable: Option<String>,
    pub custom_field_links: Vec<CustomFieldLink>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CustomFieldLink {
    pub custom_field_id: Uuid,
    pub entity: SyncEntity,
    pub external_id_field: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CustomFieldReadMapping {
    pub custom_field_id: Uuid,
    pub label: Option<Template>,
    pub key: Option<Template>,
    pub metadata: Vec<MetadataEntry>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MetadataEntry {
    pub key: String,
    pub template: Template,
}
