use std::{collections::HashMap, sync::Arc};

use async_graphql::dataloader::Loader;
use tiko_database::models::TimeEntry;
use uuid::Uuid;

use crate::graphql::shared::context::GraphQLContext;

pub struct TimeEntryByIdLoader(pub GraphQLContext);

impl Loader<Uuid> for TimeEntryByIdLoader {
    type Value = TimeEntry;
    type Error = Arc<sqlx::Error>;

    async fn load(&self, keys: &[Uuid]) -> Result<HashMap<Uuid, Self::Value>, Self::Error> {
        let entries = self.0.time_entries.find_by_ids(keys).await.map_err(Arc::new)?;

        Ok(entries.into_iter().map(|entry| (entry.id, entry)).collect())
    }
}
