use tiko_database::models::SyncEntity;

use crate::fields::{EntityFields, FieldType, field};

pub(crate) fn client() -> EntityFields {
    EntityFields {
        entity: SyncEntity::HarvestClient,
        is_time_entry: false,
        fields: vec![
            field("id", FieldType::Number, "5735776"),
            field("name", FieldType::String, "123 Industries"),
            field("is_active", FieldType::Boolean, "true"),
            field(
                "address",
                FieldType::String,
                "123 Main St.\r\nAnytown, LA 71223",
            ),
            field(
                "statement_key",
                FieldType::String,
                "0a39d3e33c8058cf7c3f8097d854c64e",
            ),
            field("currency", FieldType::String, "EUR"),
            field("created_at", FieldType::DateTime, "2017-06-26T21:02:12Z"),
            field("updated_at", FieldType::DateTime, "2017-06-26T21:34:11Z"),
        ],
    }
}

pub(crate) fn project() -> EntityFields {
    EntityFields {
        entity: SyncEntity::HarvestProject,
        is_time_entry: false,
        fields: vec![
            field("id", FieldType::String, "14308069"),
            field("client.id", FieldType::String, "5735776"),
            field("client.name", FieldType::String, "123 Industries"),
            field("client.currency", FieldType::String, "EUR"),
            field("name", FieldType::String, "Online Store - Phase 1"),
            field("code", FieldType::String, "OS1"),
            field("is_active", FieldType::Boolean, "true"),
            field("is_billable", FieldType::Boolean, "true"),
            field("is_fixed_fee", FieldType::Boolean, "false"),
            field("bill_by", FieldType::String, "Project"),
            field("hourly_rate", FieldType::Number, "100.0"),
            field("budget_by", FieldType::String, "project"),
            field("budget_is_monthly", FieldType::Boolean, "false"),
            field("budget", FieldType::Number, "200.0"),
            field("cost_budget", FieldType::Number, "null"),
            field("cost_budget_include_expenses", FieldType::Boolean, "false"),
            field("notify_when_over_budget", FieldType::Boolean, "true"),
            field(
                "over_budget_notification_percentage",
                FieldType::Number,
                "80.0",
            ),
            field("over_budget_notification_date", FieldType::Date, "null"),
            field("show_budget_to_all", FieldType::Boolean, "false"),
            field("fee", FieldType::Number, "null"),
            field("notes", FieldType::String, ""),
            field("starts_on", FieldType::Date, "2017-06-01"),
            field("ends_on", FieldType::Date, "null"),
            field("created_at", FieldType::DateTime, "2017-06-26T21:52:18Z"),
            field("updated_at", FieldType::DateTime, "2017-06-26T21:54:06Z"),
        ],
    }
}

pub(crate) fn time_entry() -> EntityFields {
    EntityFields {
        entity: SyncEntity::HarvestTimeEntry,
        is_time_entry: true,
        fields: vec![
            field("spent_date", FieldType::Date, "2026-07-20"),
            field("started_time", FieldType::String, "9:00am"),
            field("ended_time", FieldType::String, "5:00pm"),
            field("notes", FieldType::String, "Client meeting notes"),
            field("billable", FieldType::Boolean, "true"),
            field("hours", FieldType::Number, "2.5"),
            field("project.id", FieldType::String, "12345678"),
            field("client.id", FieldType::String, "12345678"),
            field("task.id", FieldType::String, "12345678"),
        ],
    }
}

pub(crate) fn task() -> EntityFields {
    EntityFields {
        entity: SyncEntity::HarvestTask,
        is_time_entry: false,
        fields: vec![
            field("name", FieldType::String, "Development"),
            field("is_active", FieldType::Boolean, "true"),
            field("billable_by_default", FieldType::Boolean, "true"),
        ],
    }
}
