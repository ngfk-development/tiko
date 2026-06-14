use clap::Args;

#[derive(Args)]
pub struct DatabaseArgs {
    #[arg(long, env = "DATABASE_URL", help = "Database connection URL")]
    pub database_url: Option<String>,

    #[arg(
        long,
        env = "DATABASE_HOST",
        default_value = "localhost",
        help = "Database host"
    )]
    pub database_host: String,

    #[arg(
        long,
        env = "DATABASE_PORT",
        default_value_t = 5432,
        help = "Database port"
    )]
    pub database_port: u16,

    #[arg(
        long,
        env = "DATABASE_USER",
        default_value = "postgres",
        help = "Database user"
    )]
    pub database_user: String,

    #[arg(long, env = "DATABASE_PASSWORD", help = "Database password")]
    pub database_password: Option<String>,

    #[arg(
        long,
        env = "DATABASE_NAME",
        default_value = "tiko",
        help = "Database name"
    )]
    pub database_name: String,
}

impl DatabaseArgs {
    pub fn get_url(&self) -> String {
        if let Some(url) = &self.database_url {
            return url.clone();
        }

        let credentials = match &self.database_password {
            Some(password) => format!("{}:{}", self.database_user, password),
            None => self.database_user.clone(),
        };

        format!(
            "postgresql://{}@{}:{}/{}",
            credentials, self.database_host, self.database_port, self.database_name
        )
    }
}
