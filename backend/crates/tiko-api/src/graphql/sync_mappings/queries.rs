use async_graphql::{ComplexObject, Context, Object, Result, SimpleObject, dataloader::DataLoader};
use chrono::{DateTime, Utc};
use tiko_database::models::SyncMapping as DbSyncMapping;
use uuid::Uuid;

use super::entity_fields::{EntityFields, entity_fields};
use super::enums::{SyncDirection, SyncEntity, SyncTrigger};
use crate::graphql::{
    integrations::{Integration, IntegrationByIdLoader, Provider},
    shared::{
        context::GraphQLContext,
        guards::{AuthGuard, current_user},
    },
};

#[derive(SimpleObject)]
#[graphql(complex)]
pub struct SyncMapping {
    id: Uuid,
    integration_id: Uuid,
    direction: SyncDirection,
    entity: SyncEntity,
    trigger: SyncTrigger,
    active: bool,
    last_synced_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<DbSyncMapping> for SyncMapping {
    fn from(mapping: DbSyncMapping) -> Self {
        SyncMapping {
            id: mapping.id,
            integration_id: mapping.integration_id,
            direction: mapping.direction.into(),
            entity: mapping.entity.into(),
            trigger: mapping.trigger.into(),
            active: mapping.active,
            last_synced_at: mapping.last_synced_at,
            created_at: mapping.created_at,
            updated_at: mapping.updated_at,
        }
    }
}

#[ComplexObject]
impl SyncMapping {
    async fn integration(&self, ctx: &Context<'_>) -> Result<Option<Integration>> {
        let loader = ctx.data::<DataLoader<IntegrationByIdLoader>>()?;
        let integration = loader.load_one(self.integration_id).await?;

        Ok(integration.map(Integration::from))
    }
}

#[derive(Default)]
pub struct SyncMappingsQuery;

#[Object]
impl SyncMappingsQuery {
    #[graphql(guard = "AuthGuard")]
    async fn sync_mappings(
        &self,
        ctx: &Context<'_>,
        provider: Option<Provider>,
    ) -> Result<Vec<SyncMapping>> {
        let user_id = current_user(ctx)?.user_id;
        let context = ctx.data::<GraphQLContext>()?;

        let sync_mappings = context
            .sync_mappings
            .list(Some(user_id), provider.map(Provider::into))
            .await?;

        Ok(sync_mappings.into_iter().map(SyncMapping::from).collect())
    }

    #[graphql(guard = "AuthGuard")]
    async fn entity_fields(&self, ctx: &Context<'_>, provider: Provider) -> Result<Vec<EntityFields>> {
        let context = ctx.data::<GraphQLContext>()?;

        Ok(entity_fields(provider, context.http.clone()))
    }
}
