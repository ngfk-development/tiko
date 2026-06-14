use tiko_database::models::Provider;

use crate::{
    harvest::HarvestProvider, moneybird::MoneybirdProvider, provider::IntegrationProvider,
    simplicate::SimplicateProvider,
};

pub fn provider_for(provider: Provider, http: reqwest::Client) -> Box<dyn IntegrationProvider> {
    match provider {
        Provider::Harvest => Box::new(HarvestProvider::new(http)),
        Provider::Moneybird => Box::new(MoneybirdProvider),
        Provider::Simplicate => Box::new(SimplicateProvider),
    }
}
