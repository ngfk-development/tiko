use bon::Builder;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::harvest::{client::pagination::IntoItems, entities::project::HarvestProject};

#[derive(Builder, Serialize, Default)]
pub struct ListProjectsQuery {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_since: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub per_page: Option<u32>,
}

#[derive(Deserialize)]
pub struct HarvestProjectsResponse {
    pub projects: Vec<HarvestProject>,
}

impl IntoItems for HarvestProjectsResponse {
    type Item = HarvestProject;

    fn into_items(self) -> Vec<Self::Item> {
        self.projects
    }
}
