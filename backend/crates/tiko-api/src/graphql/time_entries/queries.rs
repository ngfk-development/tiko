use async_graphql::SimpleObject;
use chrono::{DateTime, Utc};
use tiko_database::models::TimeEntry as DbTimeEntry;
use uuid::Uuid;

#[derive(SimpleObject)]
pub struct TimeEntry {
    id: Uuid,
    time_started: DateTime<Utc>,
    time_ended: Option<DateTime<Utc>>,
    description: Option<String>,
    billable: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<DbTimeEntry> for TimeEntry {
    fn from(entry: DbTimeEntry) -> Self {
        TimeEntry {
            id: entry.id,
            time_started: entry.time_started,
            time_ended: entry.time_ended,
            description: entry.description,
            billable: entry.billable,
            created_at: entry.created_at,
            updated_at: entry.updated_at,
        }
    }
}
