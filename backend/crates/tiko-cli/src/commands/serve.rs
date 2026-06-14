use std::error::Error;
use tiko_api::{OauthClients, TikoServer};
use tiko_providers::harvest::oauth::HarvestOauthClient;
use tiko_database::database::Database;
use tiko_sync::SyncEngine;

use crate::cli::ServeArgs;

pub async fn serve(args: ServeArgs) -> Result<(), Box<dyn Error>> {
    let database_url = args.database.get_url();
    let database = Database::new(&database_url).await?;

    let sync_engine = SyncEngine::new(database.clone());
    tokio::spawn(async move {
        if let Err(e) = sync_engine.run().await {
            tracing::error!("sync engine failed: {}", e);
        }
    });

    let oauth = OauthClients {
        harvest: HarvestOauthClient::new(
            reqwest::Client::new(),
            args.harvest_client_id,
            args.harvest_client_secret,
            args.harvest_redirect_uri,
        ),
    };

    let server = TikoServer::new(database, &args.jwt_secret, oauth);
    server.run().await?;

    Ok(())
}
