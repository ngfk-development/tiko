#[derive(thiserror::Error, Debug)]
pub enum ApiError {
    #[error("server error: {0}")]
    Io(#[from] std::io::Error),

    #[error("jwt error: {0}")]
    Jwt(#[from] jsonwebtoken::errors::Error),
}
