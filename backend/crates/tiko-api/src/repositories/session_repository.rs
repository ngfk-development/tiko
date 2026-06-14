use chrono::{DateTime, Utc};
use tiko_database::{database::Database, models::Session};
use uuid::Uuid;

#[derive(Clone)]
pub struct SessionRepository {
    database: Database,
}

impl SessionRepository {
    pub fn new(database: Database) -> Self {
        SessionRepository { database }
    }

    pub async fn create(
        &self,
        user_id: Uuid,
        expires_at: DateTime<Utc>,
        ip_address: Option<String>,
        user_agent: Option<String>,
    ) -> Result<Session, sqlx::Error> {
        let refresh_token = Uuid::new_v4().to_string();

        sqlx::query_as::<_, Session>(
            "INSERT INTO sessions (user_id, refresh_token, expires_at, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *",
        )
        .bind(user_id)
        .bind(refresh_token)
        .bind(expires_at)
        .bind(ip_address)
        .bind(user_agent)
        .fetch_one(&self.database.pool)
        .await
    }

    pub async fn rotate(
        &self,
        refresh_token: &str,
        expires_at: DateTime<Utc>,
        ip_address: Option<String>,
        user_agent: Option<String>,
    ) -> Result<Option<Session>, sqlx::Error> {
        let new_refresh_token = Uuid::new_v4().to_string();

        sqlx::query_as::<_, Session>(
            "UPDATE sessions
             SET refresh_token = $2, expires_at = $3, ip_address = $4, user_agent = $5
             WHERE refresh_token = $1 AND expires_at > now()
             RETURNING *",
        )
        .bind(refresh_token)
        .bind(new_refresh_token)
        .bind(expires_at)
        .bind(ip_address)
        .bind(user_agent)
        .fetch_optional(&self.database.pool)
        .await
    }

    pub async fn revoke(&self, refresh_token: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM sessions WHERE refresh_token = $1")
            .bind(refresh_token)
            .execute(&self.database.pool)
            .await?;

        Ok(())
    }
}
