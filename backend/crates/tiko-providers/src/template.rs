use chrono::{DateTime, NaiveDateTime, Utc};
use serde_json::Value as JsonValue;
use tiko_database::models::{CustomFieldReadMapping, TemplateWithFormat, TimeEntryReadMapping};

use crate::provider::ProviderError;

fn lookup<'a>(path: &str, raw: &'a JsonValue) -> Option<&'a JsonValue> {
    path.split('.').try_fold(raw, |value, key| value.get(key))
}

fn as_display_string(value: &JsonValue) -> Option<String> {
    match value {
        JsonValue::Null => None,
        JsonValue::String(s) => Some(s.clone()),
        other => Some(other.to_string()),
    }
}

pub fn interpolate(template: &str, raw: &JsonValue) -> String {
    let mut result = String::new();
    let mut rest = template;

    while let Some(start) = rest.find('{') {
        result.push_str(&rest[..start]);
        rest = &rest[start + 1..];

        let Some(end) = rest.find('}') else {
            result.push('{');
            result.push_str(rest);
            return result;
        };

        let path = &rest[..end];
        if let Some(value) = lookup(path, raw).and_then(as_display_string) {
            result.push_str(&value);
        }
        rest = &rest[end + 1..];
    }

    result.push_str(rest);
    result
}

pub fn interpolate_datetime(config: &TemplateWithFormat, raw: &JsonValue) -> Option<DateTime<Utc>> {
    let value = interpolate(&config.template, raw);
    NaiveDateTime::parse_from_str(&value, &config.format)
        .ok()
        .map(|naive| naive.and_utc())
}

/// Looks up a single native field (not a template) and reads it as a bool.
pub fn lookup_bool(field: &str, raw: &JsonValue) -> Option<bool> {
    lookup(field, raw).and_then(JsonValue::as_bool)
}

pub struct DerivedTimeEntryFields {
    pub time_started: DateTime<Utc>,
    pub time_ended: Option<DateTime<Utc>>,
    pub description: Option<String>,
    pub billable: bool,
}

pub fn derive_time_entry_fields(
    mapping: &TimeEntryReadMapping,
    raw: &JsonValue,
) -> Result<DerivedTimeEntryFields, ProviderError> {
    let time_started = interpolate_datetime(&mapping.started_at, raw).ok_or_else(|| {
        ProviderError::InvalidMapping(format!(
            "could not parse started_at from template {:?}",
            mapping.started_at.template
        ))
    })?;

    let time_ended = mapping
        .ended_at
        .as_ref()
        .and_then(|config| interpolate_datetime(config, raw));

    let description = mapping
        .description
        .as_ref()
        .map(|tpl| interpolate(tpl, raw))
        .filter(|value| !value.is_empty());

    let billable = mapping
        .billable
        .as_deref()
        .and_then(|field| lookup_bool(field, raw))
        .unwrap_or(false);

    Ok(DerivedTimeEntryFields {
        time_started,
        time_ended,
        description,
        billable,
    })
}

pub struct DerivedCustomFieldFields {
    pub label: Option<String>,
    pub key: Option<String>,
    pub metadata: JsonValue,
}

pub fn derive_custom_field_fields(
    mapping: &CustomFieldReadMapping,
    raw: &JsonValue,
) -> DerivedCustomFieldFields {
    let label = mapping
        .label
        .as_ref()
        .map(|tpl| interpolate(tpl, raw))
        .filter(|value| !value.is_empty());

    let key = mapping
        .key
        .as_ref()
        .map(|tpl| interpolate(tpl, raw))
        .filter(|value| !value.is_empty());

    let metadata = JsonValue::Object(
        mapping
            .metadata
            .iter()
            .map(|entry| {
                (
                    entry.key.clone(),
                    JsonValue::String(interpolate(&entry.template, raw)),
                )
            })
            .collect(),
    );

    DerivedCustomFieldFields {
        label,
        key,
        metadata,
    }
}
