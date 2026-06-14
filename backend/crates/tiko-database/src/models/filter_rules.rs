use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FilterRules {
    pub conditions: Vec<FilterCondition>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FilterCondition {
    pub field: String,
    pub op: FilterOp,
    pub value: Value,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum FilterOp {
    Eq,
    Neq,
}
