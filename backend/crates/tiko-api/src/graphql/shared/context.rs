use tiko_database::database::Database;

use crate::{
    auth::JwtIssuer,
    oauth::OauthClients,
    repositories::{
        CustomFieldRepository, IntegrationRepository, SessionRepository, SyncMappingRepository,
        SyncRecordRepository, TimeEntryRepository, UserRepository,
    },
};

#[derive(Clone)]
pub struct GraphQLContext {
    pub custom_fields: CustomFieldRepository,
    pub http: reqwest::Client,
    pub integrations: IntegrationRepository,
    pub jwt: JwtIssuer,
    pub oauth: OauthClients,
    pub sessions: SessionRepository,
    pub sync_mappings: SyncMappingRepository,
    pub sync_records: SyncRecordRepository,
    pub time_entries: TimeEntryRepository,
    pub users: UserRepository,
}

impl GraphQLContext {
    pub fn new(database: Database, jwt_secret: &str, oauth: OauthClients) -> Self {
        GraphQLContext {
            custom_fields: CustomFieldRepository::new(database.clone()),
            http: reqwest::Client::new(),
            integrations: IntegrationRepository::new(database.clone()),
            jwt: JwtIssuer::new(jwt_secret),
            oauth,
            sessions: SessionRepository::new(database.clone()),
            sync_mappings: SyncMappingRepository::new(database.clone()),
            sync_records: SyncRecordRepository::new(database.clone()),
            time_entries: TimeEntryRepository::new(database.clone()),
            users: UserRepository::new(database.clone()),
        }
    }
}
