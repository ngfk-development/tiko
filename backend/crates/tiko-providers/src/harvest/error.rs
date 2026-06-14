use reqwest::StatusCode;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum HarvestError {
    #[error("HTTP error {status}: {body}")]
    Api { status: StatusCode, body: String },

    #[error("Request failed: {0}")]
    Request(#[from] reqwest::Error),

    #[error("Deserialization failed: {0}")]
    Deserialize(String),

    #[error("OAuth error: {0}")]
    Oauth(String),
}
