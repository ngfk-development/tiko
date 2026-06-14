use reqwest::{Method, RequestBuilder};
use serde::Deserialize;

use crate::{
    harvest::{HarvestClient, auth::HarvestAuth, error::HarvestError},
    json,
};

pub(crate) trait IntoItems {
    type Item;
    fn into_items(self) -> Vec<Self::Item>;
}

#[derive(Deserialize, Debug)]
pub(crate) struct HarvestPaginatedLinks {
    pub next: Option<String>,
}

impl HarvestClient {
    pub(crate) async fn get_paginated<T>(
        &self,
        request: RequestBuilder,
        auth: &HarvestAuth,
    ) -> Result<Vec<T::Item>, HarvestError>
    where
        T: for<'de> Deserialize<'de> + IntoItems,
    {
        let mut next_request = Some(request);
        let mut items = Vec::new();

        while let Some(request) = next_request.take() {
            let body = self.send_raw(request).await?;

            let page: T =
                json::deserialize(&body).map_err(|e| HarvestError::Deserialize(e.to_string()))?;

            let links: HarvestPaginatedLinks =
                json::deserialize(&body).map_err(|e| HarvestError::Deserialize(e.to_string()))?;

            next_request = links
                .next
                .map(|url| self.req_absolute(Method::GET, url, auth));

            items.extend(page.into_items());
        }

        Ok(items)
    }
}
