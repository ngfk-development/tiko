use async_graphql::Enum;

#[derive(Enum, Copy, Clone, Eq, PartialEq)]
#[graphql(rename_items = "snake_case")]
pub enum AuthMode {
    Json,
    Cookie,
}
