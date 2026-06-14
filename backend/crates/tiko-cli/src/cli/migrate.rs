use clap::Parser;

use super::DatabaseArgs;

#[derive(Parser)]
pub struct MigrateArgs {
    #[command(flatten)]
    pub database: DatabaseArgs,
}
