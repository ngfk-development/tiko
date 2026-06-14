use std::net::SocketAddr;

use axum::{Router, routing::get};
use tiko_database::database::Database;
use tokio::net::TcpListener;

use crate::{
    error::ApiError,
    graphql::{self, GraphQLContext},
    oauth::OauthClients,
    routes,
};

#[derive(Clone)]
pub struct TikoServer {
    router: Router,
}

impl TikoServer {
    pub fn new(database: Database, jwt_secret: &str, oauth: OauthClients) -> Self {
        let context = GraphQLContext::new(database, jwt_secret, oauth);

        let router = Router::new()
            .route("/live", get(live))
            .route("/oauth/harvest", get(routes::harvest_callback))
            .with_state(context.clone())
            .nest_service("/graphql", graphql::router(context));

        TikoServer { router }
    }

    pub async fn run(&self) -> Result<(), ApiError> {
        let listener = TcpListener::bind("0.0.0.0:4000").await?;

        tracing::info!("tiko-api listening on {}", listener.local_addr()?);

        axum::serve(
            listener,
            self.router
                .clone()
                .into_make_service_with_connect_info::<SocketAddr>(),
        )
        .await?;

        Ok(())
    }
}

async fn live() -> &'static str {
    "OK"
}
