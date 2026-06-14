use bon::Builder;
use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

use crate::harvest::{client::pagination::IntoItems, entities::time_entry::HarvestTimeEntry};

#[derive(Builder, Serialize, Default)]
pub struct ListTimeEntriesQuery {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub project_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub task_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub external_reference_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_since: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub from: Option<NaiveDate>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub to: Option<NaiveDate>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<u32>,
}

#[derive(Deserialize)]
pub struct HarvestTimeEntriesResponse {
    pub time_entries: Vec<HarvestTimeEntry>,
}

impl IntoItems for HarvestTimeEntriesResponse {
    type Item = HarvestTimeEntry;

    fn into_items(self) -> Vec<Self::Item> {
        self.time_entries
    }
}
