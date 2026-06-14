use tiko_providers::ProviderError;

#[derive(thiserror::Error, Debug)]
pub enum SyncError {
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("provider error: {0}")]
    Provider(#[from] ProviderError),
}
