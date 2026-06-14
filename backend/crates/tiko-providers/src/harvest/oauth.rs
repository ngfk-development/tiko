use chrono::{DateTime, Duration, Utc};
use oauth2::basic::BasicClient;
use oauth2::{
    AuthType, AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken, RedirectUrl,
    TokenResponse, TokenUrl,
};
use serde::Deserialize;

use crate::harvest::error::HarvestError;

const AUTH_URL: &str = "https://id.getharvest.com/oauth2/authorize";
const TOKEN_URL: &str = "https://id.getharvest.com/api/v2/oauth2/token";
const ACCOUNTS_URL: &str = "https://id.getharvest.com/api/v2/accounts";

pub struct HarvestOauthTokens {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: Option<DateTime<Utc>>,
}

#[derive(Deserialize)]
struct HarvestAccountsResponse {
    accounts: Vec<HarvestAccount>,
}

#[derive(Deserialize)]
struct HarvestAccount {
    id: u64,
}

#[derive(Clone)]
pub struct HarvestOauthClient {
    client_id: String,
    client_secret: String,
    redirect_uri: String,
    /// Not the workspace `reqwest::Client` — this is oauth2's own bundled
    /// reqwest (a different major version), used only for its `request_async`
    /// helper. The accounts lookup below uses the workspace reqwest instead.
    oauth_http: oauth2::reqwest::Client,
    http: reqwest::Client,
}

impl HarvestOauthClient {
    pub fn new(
        http: reqwest::Client,
        client_id: String,
        client_secret: String,
        redirect_uri: String,
    ) -> Self {
        let oauth_http = oauth2::reqwest::ClientBuilder::new()
            // Following redirects on the token endpoint opens the client up to SSRF.
            .redirect(oauth2::reqwest::redirect::Policy::none())
            .build()
            .expect("http client should build");

        HarvestOauthClient {
            client_id,
            client_secret,
            redirect_uri,
            oauth_http,
            http,
        }
    }

    // oauth2 v5's builder is a typestate — the concrete type changes with each
    // `.set_*` call, so it can't be named/stored as a field or a shared
    // helper's return type. Inlined at both call sites below instead; it's
    // cheap to rebuild (just wrapping a few Strings/Urls).

    /// `state` should be a value only your server can have produced (e.g. a
    /// signed, short-lived token) — it's what lets the callback verify the
    /// request belongs to the session that started it, not an attacker's.
    pub fn authorize_url(&self, state: String) -> String {
        let client = BasicClient::new(ClientId::new(self.client_id.clone()))
            .set_client_secret(ClientSecret::new(self.client_secret.clone()))
            .set_auth_uri(AuthUrl::new(AUTH_URL.to_string()).expect("valid auth url"))
            .set_redirect_uri(
                RedirectUrl::new(self.redirect_uri.clone()).expect("valid redirect uri"),
            );

        let (url, _) = client.authorize_url(move || CsrfToken::new(state)).url();

        url.to_string()
    }

    pub async fn exchange_code(&self, code: String) -> Result<HarvestOauthTokens, HarvestError> {
        let client = BasicClient::new(ClientId::new(self.client_id.clone()))
            .set_client_secret(ClientSecret::new(self.client_secret.clone()))
            .set_token_uri(TokenUrl::new(TOKEN_URL.to_string()).expect("valid token url"))
            .set_redirect_uri(
                RedirectUrl::new(self.redirect_uri.clone()).expect("valid redirect uri"),
            )
            // Harvest's token endpoint expects client_id/secret as body params
            // (client_secret_post), not the oauth2 crate's default HTTP Basic
            // Auth header (client_secret_basic) — without this it rejects the
            // request as missing client_id.
            .set_auth_type(AuthType::RequestBody);

        let response = client
            .exchange_code(AuthorizationCode::new(code))
            .request_async(&self.oauth_http)
            .await
            .map_err(|e| HarvestError::Oauth(e.to_string()))?;

        let refresh_token = response
            .refresh_token()
            .ok_or_else(|| HarvestError::Oauth("no refresh token in response".to_string()))?
            .secret()
            .clone();

        let expires_at = response
            .expires_in()
            .and_then(|d| Duration::from_std(d).ok())
            .map(|d| Utc::now() + d);

        Ok(HarvestOauthTokens {
            access_token: response.access_token().secret().clone(),
            refresh_token,
            expires_at,
        })
    }

    /// Harvest's OAuth doesn't say which account(s) were authorized — a
    /// follow-up call is required. Takes the first account for now; multiple
    /// Harvest accounts on one grant would need an account picker later.
    pub async fn first_account_id(&self, access_token: &str) -> Result<String, HarvestError> {
        let response = self
            .http
            .get(ACCOUNTS_URL)
            .bearer_auth(access_token)
            .header("User-Agent", "Tiko")
            .send()
            .await?;

        let status = response.status();
        let body = response.text().await?;

        if !status.is_success() {
            return Err(HarvestError::Api { status, body });
        }

        let parsed: HarvestAccountsResponse = crate::json::deserialize(&body)
            .map_err(|e| HarvestError::Deserialize(e.to_string()))?;

        parsed
            .accounts
            .into_iter()
            .next()
            .map(|account| account.id.to_string())
            .ok_or_else(|| HarvestError::Oauth("no Harvest accounts available".to_string()))
    }
}
