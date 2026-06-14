use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct HarvestReference {
    pub id: u64,
    pub name: String,
}
