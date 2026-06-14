use clap::Parser;

use crate::cli::DatabaseArgs;

#[derive(Parser)]
pub struct ServeArgs {
    #[command(flatten)]
    pub database: DatabaseArgs,

    #[arg(
        long,
        env = "JWT_SECRET",
        help = "Secret used to sign JWT access tokens"
    )]
    pub jwt_secret: String,

    #[arg(long, env = "HARVEST_CLIENT_ID", help = "Harvest OAuth2 client ID")]
    pub harvest_client_id: String,

    #[arg(
        long,
        env = "HARVEST_CLIENT_SECRET",
        help = "Harvest OAuth2 client secret"
    )]
    pub harvest_client_secret: String,

    #[arg(
        long,
        env = "HARVEST_REDIRECT_URI",
        help = "Redirect URI registered with Harvest for the OAuth2 callback"
    )]
    pub harvest_redirect_uri: String,
}
