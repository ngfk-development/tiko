use tiko_database::{
    database::Database,
    models::{CustomField, CustomFieldValue},
};
use uuid::Uuid;

#[derive(Clone)]
pub struct CustomFieldRepository {
    database: Database,
}

impl CustomFieldRepository {
    pub fn new(database: Database) -> Self {
        CustomFieldRepository { database }
    }

    pub async fn find(&self, user_id: Uuid, id: Uuid) -> Result<Option<CustomField>, sqlx::Error> {
        sqlx::query_as::<_, CustomField>(
            "SELECT * FROM custom_fields
             WHERE user_id = $1 AND id = $2",
        )
        .bind(user_id)
        .bind(id)
        .fetch_optional(&self.database.pool)
        .await
    }

    pub async fn list(&self, user_id: Uuid) -> Result<Vec<CustomField>, sqlx::Error> {
        sqlx::query_as::<_, CustomField>(
            "SELECT * FROM custom_fields
             WHERE user_id = $1
             ORDER BY position",
        )
        .bind(user_id)
        .fetch_all(&self.database.pool)
        .await
    }

    pub async fn list_values(
        &self,
        user_id: Uuid,
        custom_field_id: Uuid,
    ) -> Result<Vec<CustomFieldValue>, sqlx::Error> {
        sqlx::query_as::<_, CustomFieldValue>(
            "SELECT cfv.*
             FROM custom_field_values cfv
             LEFT JOIN custom_fields cf ON cfv.custom_field_id = cf.id
             WHERE cf.user_id = $1 AND cfv.custom_field_id = $2",
        )
        .bind(user_id)
        .bind(custom_field_id)
        .fetch_all(&self.database.pool)
        .await
    }
}
