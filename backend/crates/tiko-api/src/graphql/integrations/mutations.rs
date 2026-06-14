use async_graphql::{Context, Object, Result};
use uuid::Uuid;

use crate::graphql::{
    integrations::queries::Integration,
    shared::{
        context::GraphQLContext,
        guards::{AuthGuard, current_user},
    },
};

#[derive(Default)]
pub struct IntegrationsMutation;

#[Object]
impl IntegrationsMutation {
    #[graphql(guard = "AuthGuard")]
    async fn delete_integration(&self, ctx: &Context<'_>, id: Uuid) -> Result<Option<Integration>> {
        let user_id = current_user(ctx)?.user_id;
        let context = ctx.data::<GraphQLContext>()?;

        let deleted = context.integrations.delete(id, user_id).await?;

        Ok(deleted.map(Integration::from))
    }
}
