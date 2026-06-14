use tiko_database::models::{
    SyncDirection as DbSyncDirection, SyncEntity as DbSyncEntity, SyncTrigger as DbSyncTrigger,
};
use tiko_providers::FieldType as DomainFieldType;

use crate::graphql::shared::mirror_enum::mirror_enum;

mirror_enum!(pub enum SyncEntity mirrors DbSyncEntity {
    HarvestTimeEntry,
    HarvestProject,
    HarvestTask,
    HarvestClient,
});

mirror_enum!(pub enum SyncDirection mirrors DbSyncDirection {
    Read,
    Write,
});

mirror_enum!(pub enum SyncTrigger mirrors DbSyncTrigger {
    Automatic,
    Cron,
    Manual,
});

mirror_enum!(pub enum FieldType mirrors DomainFieldType {
    String,
    Number,
    Boolean,
    Date,
    DateTime,
});
