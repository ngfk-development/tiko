use clap::Parser;

use crate::cli::DatabaseArgs;

#[derive(Parser)]
pub struct SeedArgs {
    #[command(flatten)]
    pub database: DatabaseArgs,

    #[arg(
        long,
        env = "SEED_USER_EMAIL",
        help = "Seed user email",
        requires = "seed_user_password"
    )]
    pub seed_user_email: Option<String>,

    #[arg(
        long,
        env = "SEED_USER_PASSWORD",
        help = "Seed user email",
        requires = "seed_user_email"
    )]
    pub seed_user_password: Option<String>,

    #[arg(
        long,
        env = "SEED_USER_FIRST_NAME",
        help = "Seed user first name",
        requires = "seed_user_email"
    )]
    pub seed_user_first_name: Option<String>,

    #[arg(
        long,
        env = "SEED_USER_LAST_NAME",
        help = "Seed user last name",
        requires = "seed_user_email"
    )]
    pub seed_user_last_name: Option<String>,
}
