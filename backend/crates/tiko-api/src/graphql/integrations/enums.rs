use async_graphql::Enum;
use tiko_database::models::{AuthType as DbAuthType, Provider as DbProvider};

use crate::graphql::shared::mirror_enum::mirror_enum;

mirror_enum!(pub enum Provider mirrors DbProvider {
    Harvest,
    Moneybird,
    Simplicate,
});

impl Provider {
    pub const ALL: [Provider; 3] = [Provider::Harvest, Provider::Moneybird, Provider::Simplicate];
}

mirror_enum!(pub enum AuthType mirrors DbAuthType {
    PersonalAccessToken,
    Oauth2 = "oauth2",
});

#[derive(Enum, Copy, Clone, Eq, PartialEq)]
#[graphql(rename_items = "snake_case")]
pub enum IntegrationStatus {
    Connected,
    Disconnected,
    ComingSoon,
}
