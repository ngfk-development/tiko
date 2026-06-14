use axum::{
    extract::{Query, State},
    response::{IntoResponse, Redirect},
};
use serde::Deserialize;
use serde_json::json;
use tiko_database::models::{AuthType, Provider};

use crate::graphql::GraphQLContext;

const INTEGRATION_PAGE: &str = "/app/integrations/harvest";

#[derive(Deserialize)]
pub struct HarvestCallbackParams {
    code: Option<String>,
    state: Option<String>,
    error: Option<String>,
}

pub async fn harvest_callback(
    State(context): State<GraphQLContext>,
    Query(params): Query<HarvestCallbackParams>,
) -> impl IntoResponse {
    if let Some(error) = params.error {
        tracing::warn!(error, "harvest oauth: denied or provider error");
        return Redirect::to(&format!("{INTEGRATION_PAGE}?error=denied"));
    }

    let (Some(code), Some(state)) = (params.code, params.state) else {
        return Redirect::to(&format!("{INTEGRATION_PAGE}?error=missing_params"));
    };

    let claims = match context.jwt.verify(&state) {
        Ok(claims) => claims,
        Err(e) => {
            tracing::warn!(error = %e, "harvest oauth: invalid state");
            return Redirect::to(&format!("{INTEGRATION_PAGE}?error=invalid_state"));
        }
    };

    let tokens = match context.oauth.harvest.exchange_code(code).await {
        Ok(tokens) => tokens,
        Err(e) => {
            tracing::error!(error = %e, "harvest oauth: code exchange failed");
            return Redirect::to(&format!("{INTEGRATION_PAGE}?error=exchange_failed"));
        }
    };

    let account_id = match context
        .oauth
        .harvest
        .first_account_id(&tokens.access_token)
        .await
    {
        Ok(id) => id,
        Err(e) => {
            tracing::error!(error = %e, "harvest oauth: fetching accounts failed");
            return Redirect::to(&format!("{INTEGRATION_PAGE}?error=no_accounts"));
        }
    };

    let auth_data = json!({
        "access_token": tokens.access_token,
        "refresh_token": tokens.refresh_token,
        "account_id": account_id,
    });

    let integration = match context
        .integrations
        .create(
            claims.sub,
            Provider::Harvest,
            AuthType::Oauth2,
            auth_data,
            tokens.expires_at,
        )
        .await
    {
        Ok(integration) => integration,
        Err(e) => {
            tracing::error!(error = %e, "harvest oauth: failed to store integration");
            return Redirect::to(&format!("{INTEGRATION_PAGE}?error=save_failed"));
        }
    };

    let provider = tiko_providers::provider_for(Provider::Harvest, context.http.clone());
    for default in provider.default_sync_mappings() {
        if let Err(e) = context
            .sync_mappings
            .create_default(integration.id, default)
            .await
        {
            tracing::error!(error = %e, "harvest oauth: failed to create default sync mapping");
        }
    }

    Redirect::to(INTEGRATION_PAGE)
}
