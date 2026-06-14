use chrono::{Duration, Utc};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    config::{ACCESS_TOKEN_ISSUER, ACCESS_TOKEN_TTL_MINUTES},
    error::ApiError,
};

#[derive(Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,
    pub iss: String,
    pub exp: i64,
}

#[derive(Clone)]
pub struct JwtIssuer {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
}

impl JwtIssuer {
    pub fn new(secret: &str) -> Self {
        JwtIssuer {
            encoding_key: EncodingKey::from_secret(secret.as_bytes()),
            decoding_key: DecodingKey::from_secret(secret.as_bytes()),
        }
    }

    pub fn issue(&self, user_id: Uuid) -> Result<String, ApiError> {
        let claims = Claims {
            sub: user_id,
            iss: ACCESS_TOKEN_ISSUER.to_string(),
            exp: (Utc::now() + Duration::minutes(ACCESS_TOKEN_TTL_MINUTES)).timestamp(),
        };

        let token = encode(&Header::default(), &claims, &self.encoding_key)?;

        Ok(token)
    }

    pub fn verify(&self, token: &str) -> Result<Claims, ApiError> {
        let mut validation = Validation::default();
        validation.set_issuer(&[ACCESS_TOKEN_ISSUER]);

        let data = decode::<Claims>(token, &self.decoding_key, &validation)?;

        Ok(data.claims)
    }
}
