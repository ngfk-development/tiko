use async_graphql::{Context, Object, Result, SimpleObject};
use chrono::{DateTime, Utc};
use serde_json::Value as JsonValue;
use tiko_database::models::CustomField as DbCustomField;
use tiko_database::models::CustomFieldValue as DbCustomFieldValue;
use uuid::Uuid;

use crate::graphql::{
    GraphQLContext,
    shared::guards::{AuthGuard, current_user},
};

#[derive(SimpleObject)]
pub struct CustomField {
    id: Uuid,
    name: String,
    description: Option<String>,
    icon: String,
    position: i32,
}

impl From<DbCustomField> for CustomField {
    fn from(custom_field: DbCustomField) -> Self {
        Self {
            id: custom_field.id,
            name: custom_field.name,
            description: custom_field.description,
            icon: custom_field.icon,
            position: custom_field.position,
        }
    }
}

#[derive(SimpleObject)]
pub struct CustomFieldValue {
    id: Uuid,
    label: String,
    key: Option<String>,
    metadata: JsonValue,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<DbCustomFieldValue> for CustomFieldValue {
    fn from(value: DbCustomFieldValue) -> Self {
        Self {
            id: value.id,
            label: value.label,
            key: value.key,
            metadata: value.metadata,
            created_at: value.created_at,
            updated_at: value.updated_at,
        }
    }
}

#[derive(Default)]
pub struct CustomFieldQuery;

#[Object]
impl CustomFieldQuery {
    #[graphql(guard = "AuthGuard")]
    async fn custom_field(&self, ctx: &Context<'_>, id: Uuid) -> Result<Option<CustomField>> {
        let user_id = current_user(ctx)?.user_id;
        let context = ctx.data::<GraphQLContext>()?;

        let custom_field = context.custom_fields.find(user_id, id).await?;

        Ok(custom_field.map(CustomField::from))
    }

    #[graphql(guard = "AuthGuard")]
    async fn custom_fields(&self, ctx: &Context<'_>) -> Result<Vec<CustomField>> {
        let user_id = current_user(ctx)?.user_id;
        let context = ctx.data::<GraphQLContext>()?;

        let custom_fields = context.custom_fields.list(user_id).await?;

        Ok(custom_fields.into_iter().map(CustomField::from).collect())
    }

    async fn custom_field_values(
        &self,
        ctx: &Context<'_>,
        custom_field_id: Uuid,
    ) -> Result<Vec<CustomFieldValue>> {
        let user_id = current_user(ctx)?.user_id;
        let context = ctx.data::<GraphQLContext>()?;

        let values = context
            .custom_fields
            .list_values(user_id, custom_field_id)
            .await?;

        Ok(values.into_iter().map(CustomFieldValue::from).collect())
    }
}
