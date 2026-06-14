mod auth;
mod custom_fields;
mod integrations;
mod shared;
mod sync_mappings;
mod sync_records;
mod time_entries;
mod users;

use std::net::SocketAddr;

use async_graphql::{EmptySubscription, MergedObject, Object, Schema, dataloader::DataLoader};
use async_graphql_axum::{GraphQLBatchRequest, GraphQLResponse};
use axum::{
    Router,
    extract::{ConnectInfo, State},
    http::HeaderMap,
    response::{Html, IntoResponse},
    routing::get,
};
use axum_extra::extract::cookie::CookieJar;

use auth::{AuthMutation, AuthQuery, RequestMeta};
use integrations::{
    IntegrationByIdLoader, IntegrationCountByUserLoader, IntegrationsByUserLoader,
    IntegrationsMutation, IntegrationsQuery,
};
pub use shared::context::GraphQLContext;
use time_entries::TimeEntryByIdLoader;
use users::UsersQuery;

use crate::{
    auth::CurrentUser,
    config::ACCESS_TOKEN_COOKIE,
    graphql::{
        custom_fields::CustomFieldQuery,
        sync_mappings::{SyncMappingsMutation, SyncMappingsQuery},
        sync_records::SyncRecordsQuery,
    },
};

#[derive(Default)]
struct RootQuery;

#[Object]
impl RootQuery {
    async fn live(&self) -> bool {
        true
    }
}

#[derive(MergedObject, Default)]
pub struct Query(
    RootQuery,
    AuthQuery,
    CustomFieldQuery,
    IntegrationsQuery,
    SyncMappingsQuery,
    SyncRecordsQuery,
    UsersQuery,
);

#[derive(MergedObject, Default)]
pub struct Mutation(AuthMutation, IntegrationsMutation, SyncMappingsMutation);

pub type ApiSchema = Schema<Query, Mutation, EmptySubscription>;

pub fn sdl() -> String {
    Schema::build(Query::default(), Mutation::default(), EmptySubscription)
        .finish()
        .sdl()
}

pub fn router(context: GraphQLContext) -> Router<()> {
    let integrations_by_user =
        DataLoader::new(IntegrationsByUserLoader(context.clone()), tokio::spawn);
    let integration_count_by_user =
        DataLoader::new(IntegrationCountByUserLoader(context.clone()), tokio::spawn);
    let integration_by_id = DataLoader::new(IntegrationByIdLoader(context.clone()), tokio::spawn);
    let time_entry_by_id = DataLoader::new(TimeEntryByIdLoader(context.clone()), tokio::spawn);

    let schema = Schema::build(Query::default(), Mutation::default(), EmptySubscription)
        .data(context)
        .data(integrations_by_user)
        .data(integration_count_by_user)
        .data(integration_by_id)
        .data(time_entry_by_id)
        .finish();

    Router::new()
        .route("/", get(graphiql).post(graphql))
        .with_state(schema)
}

async fn graphiql() -> impl IntoResponse {
    Html(
        async_graphql::http::GraphiQLSource::build()
            .endpoint("/graphql")
            .finish(),
    )
}

async fn graphql(
    State(schema): State<ApiSchema>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    jar: CookieJar,
    req: GraphQLBatchRequest,
) -> GraphQLResponse {
    let context = schema
        .data::<GraphQLContext>()
        .expect("GraphQLContext is always set on the schema");

    let current_user = CurrentUser::from_headers(&headers, &context.jwt).or_else(|| {
        jar.get(ACCESS_TOKEN_COOKIE)
            .and_then(|cookie| CurrentUser::from_token(cookie.value(), &context.jwt))
    });

    let meta = RequestMeta::from_headers(addr, &headers);

    let request = req.into_inner().data(current_user).data(meta).data(jar);

    schema.execute_batch(request).await.into()
}
