use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

use crate::harvest::entities::reference::HarvestReference;

#[derive(Debug, Serialize, Deserialize)]
pub struct HarvestExternalReference {
    pub id: String,
    pub group_id: Option<String>,
    pub account_id: Option<String>,
    pub permalink: Option<String>,
    pub service: Option<String>,
    pub service_icon_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HarvestInvoiceRef {
    pub id: u64,
    pub number: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HarvestUserAssignment {
    pub id: u64,
    pub is_project_manager: bool,
    pub is_active: bool,
    pub budget: Option<f64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub hourly_rate: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HarvestTaskAssignment {
    pub id: u64,
    pub billable: bool,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub hourly_rate: Option<f64>,
    pub budget: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HarvestTimeEntry {
    pub id: u64,
    pub spent_date: NaiveDate,
    pub user: HarvestReference,
    pub user_assignment: HarvestUserAssignment,
    pub client: HarvestReference,
    pub project: HarvestReference,
    pub task: HarvestReference,
    pub task_assignment: HarvestTaskAssignment,
    pub external_reference: Option<HarvestExternalReference>,
    pub invoice: Option<HarvestInvoiceRef>,
    pub hours: f64,
    pub hours_without_timer: f64,
    pub rounded_hours: f64,
    pub notes: Option<String>,
    pub is_locked: bool,
    pub locked_reason: Option<String>,
    pub is_closed: bool,
    pub approval_status: String,
    pub is_billed: bool,
    pub timer_started_at: Option<DateTime<Utc>>,
    pub started_time: Option<String>,
    pub ended_time: Option<String>,
    pub is_running: bool,
    pub billable: bool,
    pub budgeted: bool,
    pub billable_rate: Option<f64>,
    pub cost_rate: Option<f64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
