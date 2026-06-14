use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct HarvestClientReference {
    /// Unique ID for the client.
    pub id: u64,
    /// A textual description of the client.
    pub name: String,
    /// The currency code associated with this client.
    pub currency: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HarvestClient {
    /// Unique ID for the client.
    pub id: u32,
    /// A textual description of the client.
    pub name: String,
    /// Whether the client is active or archived.
    pub is_active: bool,
    /// The physical address for the client.
    pub address: Option<String>,
    /// Used to build a URL to your client’s invoice dashboard: https://{ACCOUNT_SUBDOMAIN}.harvestapp.com/client/statements/{STATEMENT_KEY}
    pub statement_key: String,
    /// The currency code associated with this client.
    pub currency: String,
    /// Date and time the client was created.
    pub created_at: DateTime<Utc>,
    /// Date and time the client was last updated.
    pub updated_at: DateTime<Utc>,
}
