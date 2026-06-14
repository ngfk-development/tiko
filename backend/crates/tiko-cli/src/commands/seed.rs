use std::error::Error;

use tiko_database::database::{
    Database,
    seed::{self, SeedOptions, SeedUserOptions},
};

use crate::cli::SeedArgs;

pub async fn seed(args: SeedArgs) -> Result<(), Box<dyn Error>> {
    let (Some(email), Some(password)) = (&args.seed_user_email, &args.seed_user_password) else {
        return Ok(());
    };

    let user_options = SeedUserOptions {
        email: email.to_string(),
        password: password.to_string(),
        first_name: args.seed_user_first_name.clone(),
        last_name: args.seed_user_last_name.clone(),
    };

    let options = SeedOptions { user: user_options };

    let database_url = args.database.get_url();
    let database = Database::new(&database_url).await?;

    tracing::info!("Running Tiko seeds");
    seed::run(&database, options).await?;
    tracing::info!("Seeds complete");

    Ok(())
}
