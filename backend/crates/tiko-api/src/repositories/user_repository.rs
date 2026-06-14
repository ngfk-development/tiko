use tiko_database::{
    database::{Database, verify_password},
    models::User,
};
use uuid::Uuid;

#[derive(Clone)]
pub struct UserRepository {
    database: Database,
}

impl UserRepository {
    pub fn new(database: Database) -> Self {
        UserRepository { database }
    }

    pub async fn find_by_id(&self, id: Uuid) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.database.pool)
            .await
    }

    pub async fn find_by_email(&self, email: &str) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
            .bind(email)
            .fetch_optional(&self.database.pool)
            .await
    }

    pub async fn list_paginated(&self, limit: i64, offset: i64) -> Result<Vec<User>, sqlx::Error> {
        sqlx::query_as::<_, User>(
            "SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.database.pool)
        .await
    }

    pub async fn count(&self) -> Result<i64, sqlx::Error> {
        sqlx::query_scalar("SELECT COUNT(*) FROM users")
            .fetch_one(&self.database.pool)
            .await
    }

    pub async fn verify_credentials(
        &self,
        email: &str,
        password: &str,
    ) -> Result<Option<User>, sqlx::Error> {
        let Some(user) = self.find_by_email(email).await? else {
            return Ok(None);
        };

        if verify_password(password, &user.password_hash) {
            Ok(Some(user))
        } else {
            Ok(None)
        }
    }
}
