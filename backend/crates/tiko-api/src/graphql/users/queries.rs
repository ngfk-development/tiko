use async_graphql::{ComplexObject, Context, Object, Result, SimpleObject, dataloader::DataLoader};
use tiko_database::models::User as DbUser;
use uuid::Uuid;

use crate::graphql::{
    integrations::{
        Integration, IntegrationCountByUserLoader, IntegrationsAgg, IntegrationsByUserLoader,
    },
    shared::{
        context::GraphQLContext,
        guards::{AdminGuard, SelfGuard},
        pagination,
    },
};

#[derive(SimpleObject)]
#[graphql(complex)]
pub struct User {
    id: Uuid,
    email: String,
    verified: bool,
    first_name: String,
    last_name: String,
}

impl From<DbUser> for User {
    fn from(user: DbUser) -> Self {
        User {
            id: user.id,
            email: user.email,
            verified: user.email_verified,
            first_name: user.first_name,
            last_name: user.last_name,
        }
    }
}

#[ComplexObject]
impl User {
    async fn integrations(&self, ctx: &Context<'_>) -> Result<Vec<Integration>> {
        let loader = ctx.data::<DataLoader<IntegrationsByUserLoader>>()?;
        let integrations = loader.load_one(self.id).await?.unwrap_or_default();

        Ok(integrations.into_iter().map(Integration::from).collect())
    }

    async fn integrations_agg(&self, ctx: &Context<'_>) -> Result<IntegrationsAgg> {
        let loader = ctx.data::<DataLoader<IntegrationCountByUserLoader>>()?;
        let total = loader.load_one(self.id).await?.unwrap_or(0);

        Ok(IntegrationsAgg::new(total))
    }
}

#[derive(SimpleObject)]
pub struct UsersAgg {
    total: i32,
}

#[derive(Default)]
pub struct UsersQuery;

#[Object]
impl UsersQuery {
    #[graphql(guard = "SelfGuard::new(id).or(AdminGuard)")]
    async fn user(&self, ctx: &Context<'_>, id: Uuid) -> Result<Option<User>> {
        let context = ctx.data::<GraphQLContext>()?;
        let user = context.users.find_by_id(id).await?;

        Ok(user.map(User::from))
    }

    #[graphql(guard = "AdminGuard")]
    async fn users(
        &self,
        ctx: &Context<'_>,
        #[graphql(default = 1)] page: i32,
        #[graphql(default = 20)] per_page: i32,
    ) -> Result<Vec<User>> {
        let context = ctx.data::<GraphQLContext>()?;

        let users = context
            .users
            .list_paginated(per_page.into(), pagination::offset(page, per_page).into())
            .await?;

        Ok(users.into_iter().map(User::from).collect())
    }

    #[graphql(guard = "AdminGuard")]
    async fn users_agg(&self, ctx: &Context<'_>) -> Result<UsersAgg> {
        let context = ctx.data::<GraphQLContext>()?;
        let total = context.users.count().await?;

        Ok(UsersAgg {
            total: total as i32,
        })
    }
}
