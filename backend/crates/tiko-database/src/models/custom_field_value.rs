use sqlx::types::JsonValue;
use sqlx::types::chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct CustomFieldValue {
    pub id: Uuid,
    pub custom_field_id: Uuid,
    pub label: String,
    pub key: Option<String>,
    pub metadata: JsonValue,
    pub parent_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
