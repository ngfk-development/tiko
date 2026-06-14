use tiko_database::{
    database::Database,
    models::{Provider, SyncRecord},
};
use uuid::Uuid;

#[derive(Clone)]
pub struct SyncRecordRepository {
    database: Database,
}

impl SyncRecordRepository {
    pub fn new(database: Database) -> Self {
        SyncRecordRepository { database }
    }

    pub async fn list_paginated(
        &self,
        user_id: Uuid,
        provider: Option<Provider>,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<SyncRecord>, sqlx::Error> {
        sqlx::query_as::<_, SyncRecord>(
            "SELECT sr.*
             FROM sync_records sr
             JOIN integrations i ON sr.integration_id = i.id
             WHERE i.user_id = $1
               AND ($2::text IS NULL OR i.provider = $2)
             ORDER BY sr.created_at DESC
             LIMIT $3 OFFSET $4",
        )
        .bind(user_id)
        .bind(provider)
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.database.pool)
        .await
    }

    pub async fn count(
        &self,
        user_id: Uuid,
        provider: Option<Provider>,
    ) -> Result<i64, sqlx::Error> {
        sqlx::query_scalar(
            "SELECT COUNT(*)
             FROM sync_records sr
             JOIN integrations i ON sr.integration_id = i.id
             WHERE i.user_id = $1
               AND ($2::text IS NULL OR i.provider = $2)",
        )
        .bind(user_id)
        .bind(provider)
        .fetch_one(&self.database.pool)
        .await
    }
}
