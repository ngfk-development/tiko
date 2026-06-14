use std::collections::HashMap;

use async_graphql::{Context, Object, Result, SimpleObject};
use chrono::{DateTime, Utc};
use tiko_database::models::Integration as DbIntegration;
use uuid::Uuid;

use crate::graphql::{
    integrations::enums::{AuthType, IntegrationStatus, Provider},
    shared::{
        context::GraphQLContext,
        guards::{AuthGuard, current_user},
    },
};

#[derive(SimpleObject)]
pub struct IntegrationProvider {
    provider: Provider,
    status: IntegrationStatus,
    connect_url: Option<String>,
    integrations: Vec<Integration>,
}

#[derive(SimpleObject)]
pub struct Integration {
    id: Uuid,
    provider: Provider,
    auth_type: AuthType,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<DbIntegration> for Integration {
    fn from(integration: DbIntegration) -> Self {
        Integration {
            id: integration.id,
            provider: integration.provider.into(),
            auth_type: integration.auth_type.into(),
            created_at: integration.created_at,
            updated_at: integration.updated_at,
        }
    }
}

#[derive(SimpleObject)]
pub struct IntegrationsAgg {
    total: i32,
}

impl IntegrationsAgg {
    pub(crate) fn new(total: i64) -> Self {
        IntegrationsAgg {
            total: total as i32,
        }
    }
}

#[derive(Default)]
pub struct IntegrationsQuery;

#[Object]
impl IntegrationsQuery {
    #[graphql(guard = "AuthGuard")]
    async fn integration_providers(
        &self,
        ctx: &Context<'_>,
        provider: Option<Provider>,
        status: Option<IntegrationStatus>,
    ) -> Result<Vec<IntegrationProvider>> {
        let user_id = current_user(ctx)?.user_id;
        let context = ctx.data::<GraphQLContext>()?;

        let state = context
            .jwt
            .issue(user_id)
            .map_err(|e| async_graphql::Error::new(e.to_string()))?;

        let integrations: Vec<Integration> = context
            .integrations
            .list(Some(user_id), provider.map(Provider::into))
            .await?
            .into_iter()
            .map(Integration::from)
            .collect();

        let mut grouped: HashMap<Provider, Vec<Integration>> = HashMap::new();
        for integration in integrations {
            grouped
                .entry(integration.provider)
                .or_default()
                .push(integration);
        }

        let providers = provider.map_or_else(|| Provider::ALL.to_vec(), |p| vec![p]);

        let integration_providers = providers
            .into_iter()
            .map(|provider| {
                let integrations = grouped.remove(&provider).unwrap_or_default();

                let connect_url = context.oauth.connect_url(provider.into(), state.clone());

                let status = if connect_url.is_none() {
                    IntegrationStatus::ComingSoon
                } else if !integrations.is_empty() {
                    IntegrationStatus::Connected
                } else {
                    IntegrationStatus::Disconnected
                };

                IntegrationProvider {
                    provider,
                    status,
                    connect_url,
                    integrations,
                }
            })
            .filter(|entry| status.is_none_or(|s| s == entry.status))
            .collect();

        Ok(integration_providers)
    }

    #[graphql(guard = "AuthGuard")]
    async fn integrations(
        &self,
        ctx: &Context<'_>,
        provider: Option<Provider>,
    ) -> Result<Vec<Integration>> {
        let user_id = current_user(ctx)?.user_id;
        let context = ctx.data::<GraphQLContext>()?;

        let integrations = context
            .integrations
            .list(Some(user_id), provider.map(Provider::into))
            .await?;

        Ok(integrations.into_iter().map(Integration::from).collect())
    }
}
