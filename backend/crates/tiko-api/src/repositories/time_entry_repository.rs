use tiko_database::{database::Database, models::TimeEntry};
use uuid::Uuid;

#[derive(Clone)]
pub struct TimeEntryRepository {
    database: Database,
}

impl TimeEntryRepository {
    pub fn new(database: Database) -> Self {
        TimeEntryRepository { database }
    }

    pub async fn find_by_ids(&self, ids: &[Uuid]) -> Result<Vec<TimeEntry>, sqlx::Error> {
        sqlx::query_as::<_, TimeEntry>("SELECT * FROM time_entries WHERE id = ANY($1)")
            .bind(ids)
            .fetch_all(&self.database.pool)
            .await
    }
}
