use clap::Parser;

mod database;
mod migrate;
mod schema;
mod seed;
mod serve;

pub use database::DatabaseArgs;
pub use migrate::MigrateArgs;
pub use schema::SchemaArgs;
pub use seed::SeedArgs;
pub use serve::ServeArgs;

#[derive(Parser)]
#[command(name = "tiko")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,

    #[arg(
        long,
        global = true,
        default_value = "info",
        help = "Log level (trace, debug, info, warn, error)"
    )]
    pub log_level: String,
}

#[derive(clap::Subcommand)]
pub enum Commands {
    Migrate(MigrateArgs),
    Schema(SchemaArgs),
    Seed(SeedArgs),
    Serve(ServeArgs),
}
