use tiko_database::models::Provider;
use tiko_providers::harvest::oauth::HarvestOauthClient;

/// Owns every provider's OAuth client, so adding a new provider only means
/// adding a field and a match arm here — callers never need to know which
/// providers actually support OAuth.
#[derive(Clone)]
pub struct OauthClients {
    pub harvest: HarvestOauthClient,
}

impl OauthClients {
    /// `state` should be a value only this server can have produced (e.g. a
    /// signed, short-lived token identifying the requesting user) — it's what
    /// lets the callback verify the request belongs to the session that
    /// started it, not an attacker's.
    pub fn connect_url(&self, provider: Provider, state: String) -> Option<String> {
        match provider {
            Provider::Harvest => Some(self.harvest.authorize_url(state)),
            Provider::Moneybird => None,
            Provider::Simplicate => None,
        }
    }
}
