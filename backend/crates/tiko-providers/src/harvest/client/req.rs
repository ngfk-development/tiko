use reqwest::{Method, RequestBuilder};

use crate::harvest::{HarvestClient, auth::HarvestAuth, error::HarvestError};

impl HarvestClient {
    pub(crate) fn get(&self, path: &str, auth: &HarvestAuth) -> RequestBuilder {
        self.req(Method::GET, path, auth)
    }

    pub(crate) fn req(&self, method: Method, path: &str, auth: &HarvestAuth) -> RequestBuilder {
        self.req_absolute(method, format!("{}{}", Self::BASE_URL, path), auth)
    }

    pub(crate) fn req_absolute(
        &self,
        method: Method,
        url: String,
        auth: &HarvestAuth,
    ) -> RequestBuilder {
        self.client
            .request(method, url)
            .bearer_auth(auth.token())
            .header("User-Agent", "Tiko")
            .header("Harvest-Account-Id", auth.account_id())
    }

    pub(crate) async fn send_raw(&self, request: RequestBuilder) -> Result<String, HarvestError> {
        if tracing::enabled!(tracing::Level::TRACE) {
            if let Some(built) = request.try_clone().and_then(|r| r.build().ok()) {
                tracing::trace!(method = %built.method(), url = %built.url(), "harvest: sending request");
            }
        }

        let response = request.send().await?;
        let status = response.status();
        let body = response.text().await?;

        if !status.is_success() {
            return Err(HarvestError::Api { status, body });
        }

        Ok(body)
    }
}
