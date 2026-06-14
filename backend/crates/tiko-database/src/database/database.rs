use sqlx::{Pool, Postgres, postgres::PgPoolOptions};

#[derive(Clone)]
pub struct Database {
    pub pool: Pool<Postgres>,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        let pool = PgPoolOptions::new().connect(database_url).await?;
        Ok(Database { pool })
    }
}
