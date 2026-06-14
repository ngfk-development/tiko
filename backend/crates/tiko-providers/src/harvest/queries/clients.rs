use bon::Builder;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::harvest::{client::pagination::IntoItems, entities::client::HarvestClient};

#[derive(Builder, Serialize, Default)]
pub struct ListClientsQuery {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_active: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_since: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<u32>,
}

#[derive(Deserialize)]
pub struct HarvestClientsResponse {
    pub clients: Vec<HarvestClient>,
}

impl IntoItems for HarvestClientsResponse {
    type Item = HarvestClient;

    fn into_items(self) -> Vec<Self::Item> {
        self.clients
    }
}
