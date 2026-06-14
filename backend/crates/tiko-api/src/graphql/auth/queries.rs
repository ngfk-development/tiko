use async_graphql::{Context, Object, Result, SimpleObject};
use uuid::Uuid;

use crate::graphql::shared::{
    context::GraphQLContext,
    guards::{AuthError, AuthGuard, current_user},
};

#[derive(SimpleObject)]
pub struct Me {
    id: Uuid,
    email: String,
    first_name: String,
    last_name: String,
    admin: bool,
}

#[derive(Default)]
pub struct AuthQuery;

#[Object]
impl AuthQuery {
    #[graphql(guard = "AuthGuard")]
    async fn me(&self, ctx: &Context<'_>) -> Result<Me> {
        let requester = current_user(ctx)?;
        let context = ctx.data::<GraphQLContext>()?;

        let user = context
            .users
            .find_by_id(requester.user_id)
            .await?
            .ok_or(AuthError::Unauthenticated)?;

        Ok(Me {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            admin: user.admin,
        })
    }
}
