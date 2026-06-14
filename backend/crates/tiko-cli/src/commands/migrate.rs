use std::error::Error;

use tiko_database::database::{Database, migrate};

use crate::cli::MigrateArgs;

pub async fn migrate(args: MigrateArgs) -> Result<(), Box<dyn Error>> {
    let database_url = args.database.get_url();
    let database = Database::new(&database_url).await?;

    tracing::info!("Running Tiko migrations");
    migrate::run(&database).await?;
    tracing::info!("Migrations complete");

    Ok(())
}
