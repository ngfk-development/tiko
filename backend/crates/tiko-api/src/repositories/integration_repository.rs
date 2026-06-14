use chrono::{DateTime, Utc};
use tiko_database::{
    database::Database,
    models::{AuthType, Integration, Provider},
};
use uuid::Uuid;

#[derive(Clone)]
pub struct IntegrationRepository {
    database: Database,
}

impl IntegrationRepository {
    pub fn new(database: Database) -> Self {
        IntegrationRepository { database }
    }

    pub async fn find(&self, id: Uuid, user_id: Uuid) -> Result<Option<Integration>, sqlx::Error> {
        sqlx::query_as::<_, Integration>(
            "SELECT * FROM integrations WHERE id = $1 AND user_id = $2",
        )
        .bind(id)
        .bind(user_id)
        .fetch_optional(&self.database.pool)
        .await
    }

    pub async fn list(
        &self,
        user_id: Option<Uuid>,
        provider: Option<Provider>,
    ) -> Result<Vec<Integration>, sqlx::Error> {
        sqlx::query_as::<_, Integration>(
            "SELECT * FROM integrations
             WHERE ($1::uuid IS NULL OR user_id = $1)
               AND ($2::text IS NULL OR provider = $2)
             ORDER BY created_at DESC",
        )
        .bind(user_id)
        .bind(provider)
        .fetch_all(&self.database.pool)
        .await
    }

    pub async fn create(
        &self,
        user_id: Uuid,
        provider: Provider,
        auth_type: AuthType,
        auth_data: serde_json::Value,
        token_expires_at: Option<DateTime<Utc>>,
    ) -> Result<Integration, sqlx::Error> {
        sqlx::query_as::<_, Integration>(
            "INSERT INTO integrations (user_id, provider, auth_type, auth_data, token_expires_at)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *",
        )
        .bind(user_id)
        .bind(provider)
        .bind(auth_type)
        .bind(auth_data)
        .bind(token_expires_at)
        .fetch_one(&self.database.pool)
        .await
    }

    pub async fn delete(
        &self,
        id: Uuid,
        user_id: Uuid,
    ) -> Result<Option<Integration>, sqlx::Error> {
        sqlx::query_as::<_, Integration>(
            "DELETE FROM integrations WHERE id = $1 AND user_id = $2 RETURNING *",
        )
        .bind(id)
        .bind(user_id)
        .fetch_optional(&self.database.pool)
        .await
    }

    pub async fn find_by_user_ids(
        &self,
        user_ids: &[Uuid],
    ) -> Result<Vec<Integration>, sqlx::Error> {
        sqlx::query_as::<_, Integration>("SELECT * FROM integrations WHERE user_id = ANY($1)")
            .bind(user_ids)
            .fetch_all(&self.database.pool)
            .await
    }

    pub async fn find_by_ids(&self, ids: &[Uuid]) -> Result<Vec<Integration>, sqlx::Error> {
        sqlx::query_as::<_, Integration>("SELECT * FROM integrations WHERE id = ANY($1)")
            .bind(ids)
            .fetch_all(&self.database.pool)
            .await
    }

    pub async fn count_by_user_ids(
        &self,
        user_ids: &[Uuid],
    ) -> Result<Vec<(Uuid, i64)>, sqlx::Error> {
        sqlx::query_as::<_, (Uuid, i64)>(
            "SELECT user_id, COUNT(*) FROM integrations WHERE user_id = ANY($1) GROUP BY user_id",
        )
        .bind(user_ids)
        .fetch_all(&self.database.pool)
        .await
    }
}
