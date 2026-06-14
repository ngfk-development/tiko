use reqwest::Client;

pub mod list;
pub mod pagination;
pub mod req;

#[derive(Clone)]
pub struct HarvestClient {
    client: Client,
}

impl HarvestClient {
    const BASE_URL: &str = "https://api.harvestapp.com/v2";

    pub fn new(client: Client) -> Self {
        HarvestClient { client }
    }
}
