use tiko_database::{
    database::Database,
    models::{
        FieldMappingConfig, FilterRules, Provider, SyncDirection, SyncEntity, SyncMapping,
        SyncTrigger,
    },
};
use tiko_providers::DefaultSyncMapping;
use uuid::Uuid;

#[derive(Clone)]
pub struct SyncMappingRepository {
    database: Database,
}

impl SyncMappingRepository {
    pub fn new(database: Database) -> Self {
        SyncMappingRepository { database }
    }

    pub async fn list(
        &self,
        user_id: Option<Uuid>,
        provider: Option<Provider>,
    ) -> Result<Vec<SyncMapping>, sqlx::Error> {
        sqlx::query_as::<_, SyncMapping>(
            "SELECT sm.*
             FROM sync_mappings sm
             LEFT JOIN integrations i ON sm.integration_id = i.id
             WHERE ($1::uuid IS NULL OR i.user_id = $1)
               AND ($2::text IS NULL OR i.provider = $2)
             ORDER BY sm.created_at DESC",
        )
        .bind(user_id)
        .bind(provider)
        .fetch_all(&self.database.pool)
        .await
    }

    pub async fn create_default(
        &self,
        integration_id: Uuid,
        default: DefaultSyncMapping,
    ) -> Result<SyncMapping, sqlx::Error> {
        sqlx::query_as::<_, SyncMapping>(
            "INSERT INTO sync_mappings
                (integration_id, direction, entity, trigger, trigger_metadata, filter_rules, field_mappings, active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *",
        )
        .bind(integration_id)
        .bind(default.direction)
        .bind(default.entity)
        .bind(default.trigger)
        .bind(default.trigger_metadata)
        .bind(sqlx::types::Json(default.filter_rules))
        .bind(sqlx::types::Json(default.field_mappings))
        .bind(false)
        .fetch_one(&self.database.pool)
        .await
    }

    pub async fn create(
        &self,
        integration_id: Uuid,
        entity: SyncEntity,
        trigger: SyncTrigger,
        field_mappings: FieldMappingConfig,
    ) -> Result<SyncMapping, sqlx::Error> {
        sqlx::query_as::<_, SyncMapping>(
            "INSERT INTO sync_mappings
                (integration_id, direction, entity, trigger, trigger_metadata, filter_rules, field_mappings, active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *",
        )
        .bind(integration_id)
        .bind(SyncDirection::Read)
        .bind(entity)
        .bind(trigger)
        .bind(serde_json::json!({}))
        .bind(sqlx::types::Json(FilterRules { conditions: vec![] }))
        .bind(sqlx::types::Json(field_mappings))
        .bind(false)
        .fetch_one(&self.database.pool)
        .await
    }
}
