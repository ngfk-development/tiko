mod cli;
mod commands;

use clap::Parser;
use cli::{Cli, Commands};
use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let cli = Cli::parse();

    let log_level = cli.log_level;

    let filter = tracing_subscriber::EnvFilter::new(format!(
        "warn,tiko_api={level},tiko_cli={level},tiko_database={level},tiko_sync={level},tiko_providers={level}",
        level = log_level
    ));

    tracing_subscriber::fmt()
        .with_target(false)
        .with_thread_ids(false)
        .with_level(true)
        .with_env_filter(filter)
        .init();

    match cli.command {
        Commands::Migrate(args) => commands::migrate(args).await?,
        Commands::Schema(args) => commands::schema(args).await?,
        Commands::Seed(args) => commands::seed(args).await?,
        Commands::Serve(args) => commands::serve(args).await?,
    };

    Ok(())
}
