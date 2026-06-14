use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

use crate::harvest::entities::client::HarvestClientReference;

#[derive(Debug, Serialize, Deserialize)]
pub struct HarvestProject {
    /// Unique ID for the project.
    pub id: u64,
    /// An object containing the project’s client id, name, and currency.
    pub client: HarvestClientReference,
    /// Unique name for the project.
    pub name: String,
    /// The code associated with the project.
    pub code: Option<String>,
    /// Whether the project is active or archived.
    pub is_active: bool,
    /// Whether the project is billable or not.
    pub is_billable: bool,
    /// Whether the project is a fixed-fee project or not.
    pub is_fixed_fee: bool,
    /// The method by which the project is invoiced.
    pub bill_by: Option<String>,
    /// Rate for projects billed by Project Hourly Rate.
    pub hourly_rate: Option<f64>,
    /// The method by which the project is budgeted.
    pub budget_by: Option<String>,
    /// Option to have the budget reset every month.
    pub budget_is_monthly: bool,
    /// The budget in hours for the project when budgeting by time.
    pub budget: Option<f64>,
    /// The monetary budget for the project when budgeting by money.
    pub cost_budget: Option<f64>,
    /// Option for budget of Total Project Fees projects to include tracked expenses.
    pub cost_budget_include_expenses: bool,
    /// Whether Project Managers should be notified when the project goes over budget.
    pub notify_when_over_budget: bool,
    /// Percentage value used to trigger over budget email alerts.
    pub over_budget_notification_percentage: Option<f64>,
    /// Date of last over budget notification. If none have been sent, this will be null.
    pub over_budget_notification_date: Option<NaiveDate>,
    /// Option to show project budget to all employees. Does not apply to Total Project Fee projects.
    pub show_budget_to_all: bool,
    /// The amount you plan to invoice for the project. Only used by fixed-fee projects.
    pub fee: Option<f64>,
    /// Project notes.
    pub notes: Option<String>,
    /// Date the project was started.
    pub starts_on: Option<NaiveDate>,
    /// Date the project will end.
    pub ends_on: Option<NaiveDate>,
    /// Date and time the project was created.
    pub created_at: DateTime<Utc>,
    /// Date and time the project was last updated.
    pub updated_at: DateTime<Utc>,
}
