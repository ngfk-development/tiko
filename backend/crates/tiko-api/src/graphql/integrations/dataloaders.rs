use std::{collections::HashMap, sync::Arc};

use async_graphql::dataloader::Loader;
use tiko_database::models::Integration;
use uuid::Uuid;

use crate::graphql::shared::context::GraphQLContext;

pub struct IntegrationsByUserLoader(pub GraphQLContext);

impl Loader<Uuid> for IntegrationsByUserLoader {
    type Value = Vec<Integration>;
    type Error = Arc<sqlx::Error>;

    async fn load(&self, keys: &[Uuid]) -> Result<HashMap<Uuid, Self::Value>, Self::Error> {
        let integrations = self
            .0
            .integrations
            .find_by_user_ids(keys)
            .await
            .map_err(Arc::new)?;

        let mut grouped: HashMap<Uuid, Vec<Integration>> = HashMap::new();
        for integration in integrations {
            grouped
                .entry(integration.user_id)
                .or_default()
                .push(integration);
        }

        Ok(grouped)
    }
}

pub struct IntegrationByIdLoader(pub GraphQLContext);

impl Loader<Uuid> for IntegrationByIdLoader {
    type Value = Integration;
    type Error = Arc<sqlx::Error>;

    async fn load(&self, keys: &[Uuid]) -> Result<HashMap<Uuid, Self::Value>, Self::Error> {
        let integrations = self.0.integrations.find_by_ids(keys).await.map_err(Arc::new)?;

        Ok(integrations
            .into_iter()
            .map(|integration| (integration.id, integration))
            .collect())
    }
}

pub struct IntegrationCountByUserLoader(pub GraphQLContext);

impl Loader<Uuid> for IntegrationCountByUserLoader {
    type Value = i64;
    type Error = Arc<sqlx::Error>;

    async fn load(&self, keys: &[Uuid]) -> Result<HashMap<Uuid, Self::Value>, Self::Error> {
        let counts = self
            .0
            .integrations
            .count_by_user_ids(keys)
            .await
            .map_err(Arc::new)?;

        Ok(counts.into_iter().collect())
    }
}
