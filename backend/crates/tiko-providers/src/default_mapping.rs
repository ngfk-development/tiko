use tiko_database::models::{FieldMappingConfig, FilterRules, SyncDirection, SyncEntity, SyncTrigger};

pub struct DefaultSyncMapping {
    pub direction: SyncDirection,
    pub entity: SyncEntity,
    pub trigger: SyncTrigger,
    pub trigger_metadata: serde_json::Value,
    pub filter_rules: FilterRules,
    pub field_mappings: FieldMappingConfig,
}
