use tiko_database::models::SyncEntity;

pub enum FieldType {
    String,
    Number,
    Boolean,
    Date,
    DateTime,
}

pub struct Field {
    pub key: String,
    pub field_type: FieldType,
    pub example: String,
}

pub struct EntityFields {
    pub entity: SyncEntity,
    pub is_time_entry: bool,
    pub fields: Vec<Field>,
}

pub(crate) fn field(key: &str, field_type: FieldType, example: &str) -> Field {
    Field {
        key: key.to_string(),
        field_type,
        example: example.to_string(),
    }
}
