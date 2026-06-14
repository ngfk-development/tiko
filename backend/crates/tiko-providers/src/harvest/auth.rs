use serde::Deserialize;

#[derive(Deserialize)]
pub struct PersonalAccessTokenAuth {
    pub token: String,
    pub account_id: String,
}

#[derive(Deserialize)]
pub struct Oauth2Auth {
    pub access_token: String,
    pub refresh_token: String,
    pub account_id: String,
}

pub enum HarvestAuth {
    PersonalAccessToken(PersonalAccessTokenAuth),
    Oauth2(Oauth2Auth),
}

impl HarvestAuth {
    pub fn token(&self) -> &str {
        match self {
            HarvestAuth::PersonalAccessToken(auth) => &auth.token,
            HarvestAuth::Oauth2(auth) => &auth.access_token,
        }
    }

    pub fn account_id(&self) -> &str {
        match self {
            HarvestAuth::PersonalAccessToken(auth) => &auth.account_id,
            HarvestAuth::Oauth2(auth) => &auth.account_id,
        }
    }
}
