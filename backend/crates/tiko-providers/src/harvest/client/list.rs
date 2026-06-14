use crate::harvest::{
    HarvestClient, auth::HarvestAuth, entities as e, error::HarvestError, queries as q,
};

impl HarvestClient {
    pub async fn list_clients(
        &self,
        auth: &HarvestAuth,
        query: q::clients::ListClientsQuery,
    ) -> Result<Vec<e::client::HarvestClient>, HarvestError> {
        let request = self.get("/clients", auth).query(&query);

        self.get_paginated::<q::clients::HarvestClientsResponse>(request, auth)
            .await
    }

    pub async fn list_time_entries(
        &self,
        auth: &HarvestAuth,
        query: q::time_entries::ListTimeEntriesQuery,
    ) -> Result<Vec<e::time_entry::HarvestTimeEntry>, HarvestError> {
        let request = self.get("/time_entries", auth).query(&query);

        self.get_paginated::<q::time_entries::HarvestTimeEntriesResponse>(request, auth)
            .await
    }

    pub async fn list_projects(
        &self,
        auth: &HarvestAuth,
        query: q::projects::ListProjectsQuery,
    ) -> Result<Vec<e::project::HarvestProject>, HarvestError> {
        let request = self.get("/projects", auth).query(&query);

        self.get_paginated::<q::projects::HarvestProjectsResponse>(request, auth)
            .await
    }
}
