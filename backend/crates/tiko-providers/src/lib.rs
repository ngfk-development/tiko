mod default_mapping;
mod fields;
pub(crate) mod json;
mod provider;
mod registry;
mod template;

pub mod harvest;
pub mod moneybird;
pub mod simplicate;

pub use default_mapping::DefaultSyncMapping;
pub use fields::{EntityFields, Field, FieldType};
pub use provider::{IntegrationProvider, ProviderError, ProviderReferenceEntry, ProviderTimeEntry};
pub use registry::provider_for;
pub use template::{
    DerivedCustomFieldFields, DerivedTimeEntryFields, derive_custom_field_fields,
    derive_time_entry_fields,
};
