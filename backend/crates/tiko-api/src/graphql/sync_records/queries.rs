use async_graphql::{ComplexObject, Context, Object, Result, SimpleObject, dataloader::DataLoader};
use chrono::{DateTime, Utc};
use tiko_database::models::SyncRecord as DbSyncRecord;
use uuid::Uuid;

use crate::graphql::{
    integrations::{Integration, IntegrationByIdLoader, Provider},
    shared::{
        context::GraphQLContext,
        guards::{AuthGuard, current_user},
        pagination,
    },
    sync_mappings::SyncEntity,
    time_entries::{TimeEntry, TimeEntryByIdLoader},
};

#[derive(SimpleObject)]
#[graphql(complex)]
pub struct SyncRecord {
    id: Uuid,
    entity: SyncEntity,
    external_id: Option<String>,
    integration_id: Uuid,
    time_entry_id: Option<Uuid>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<DbSyncRecord> for SyncRecord {
    fn from(record: DbSyncRecord) -> Self {
        SyncRecord {
            id: record.id,
            entity: record.entity.into(),
            external_id: record.external_id,
            integration_id: record.integration_id,
            time_entry_id: record.time_entry_id,
            created_at: record.created_at,
            updated_at: record.updated_at,
        }
    }
}

#[ComplexObject]
impl SyncRecord {
    async fn integration(&self, ctx: &Context<'_>) -> Result<Option<Integration>> {
        let loader = ctx.data::<DataLoader<IntegrationByIdLoader>>()?;
        let integration = loader.load_one(self.integration_id).await?;

        Ok(integration.map(Integration::from))
    }

    async fn time_entry(&self, ctx: &Context<'_>) -> Result<Option<TimeEntry>> {
        let Some(time_entry_id) = self.time_entry_id else {
            return Ok(None);
        };

        let loader = ctx.data::<DataLoader<TimeEntryByIdLoader>>()?;
        let time_entry = loader.load_one(time_entry_id).await?;

        Ok(time_entry.map(TimeEntry::from))
    }
}

#[derive(SimpleObject)]
pub struct SyncRecordsAgg {
    total: i32,
}

#[derive(Default)]
pub struct SyncRecordsQuery;

#[Object]
impl SyncRecordsQuery {
    #[graphql(guard = "AuthGuard")]
    async fn sync_records(
        &self,
        ctx: &Context<'_>,
        provider: Option<Provider>,
        #[graphql(default = 1)] page: i32,
        #[graphql(default = 20)] per_page: i32,
    ) -> Result<Vec<SyncRecord>> {
        let user_id = current_user(ctx)?.user_id;
        let context = ctx.data::<GraphQLContext>()?;

        let records = context
            .sync_records
            .list_paginated(
                user_id,
                provider.map(Provider::into),
                per_page.into(),
                pagination::offset(page, per_page).into(),
            )
            .await?;

        Ok(records.into_iter().map(SyncRecord::from).collect())
    }

    #[graphql(guard = "AuthGuard")]
    async fn sync_records_agg(
        &self,
        ctx: &Context<'_>,
        provider: Option<Provider>,
    ) -> Result<SyncRecordsAgg> {
        let user_id = current_user(ctx)?.user_id;
        let context = ctx.data::<GraphQLContext>()?;

        let total = context
            .sync_records
            .count(user_id, provider.map(Provider::into))
            .await?;

        Ok(SyncRecordsAgg {
            total: total as i32,
        })
    }
}
