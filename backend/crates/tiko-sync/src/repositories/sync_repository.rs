use sqlx::types::chrono::{DateTime, Utc};
use sqlx::{Postgres, Transaction, types::Uuid};
use tiko_database::{
    database::Database,
    models::{CustomFieldValue, Integration, SyncEntity, SyncMapping, SyncRecord, TimeEntry},
};

use tiko_providers::{DerivedTimeEntryFields, ProviderReferenceEntry, ProviderTimeEntry};

#[derive(Clone)]
pub struct SyncRepository {
    database: Database,
}

impl SyncRepository {
    pub fn new(database: Database) -> Self {
        SyncRepository { database }
    }

    pub async fn get_integration(&self, id: Uuid) -> Result<Integration, sqlx::Error> {
        sqlx::query_as::<_, Integration>("SELECT * FROM integrations WHERE id = $1")
            .bind(id)
            .fetch_one(&self.database.pool)
            .await
    }

    pub async fn find_active_reads(&self) -> Result<Vec<SyncMapping>, sqlx::Error> {
        sqlx::query_as::<_, SyncMapping>(
            "SELECT * FROM sync_mappings
             WHERE direction = 'read' AND active = true",
        )
        .fetch_all(&self.database.pool)
        .await
    }

    pub async fn mark_mapping_synced(
        &self,
        mapping_id: Uuid,
        at: DateTime<Utc>,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE sync_mappings SET last_synced_at = $2 WHERE id = $1")
            .bind(mapping_id)
            .bind(at)
            .execute(&self.database.pool)
            .await?;

        Ok(())
    }

    pub async fn process_entry(
        &self,
        integration: &Integration,
        entry: ProviderTimeEntry,
    ) -> Result<TimeEntry, sqlx::Error> {
        let mut tx = self.database.pool.begin().await?;

        let record = sqlx::query_as::<_, SyncRecord>(
            "SELECT sync_records.* FROM sync_records
             WHERE time_entry_id IS NOT NULL
               AND integration_id = $1
               AND entity = $2
               AND external_id = $3",
        )
        .bind(integration.id)
        .bind(entry.entity)
        .bind(&entry.external_id)
        .fetch_optional(&mut *tx)
        .await?;

        let time_entry = match record {
            None => self.insert_entry(&mut tx, integration, &entry).await?,
            Some(record) if record.data != entry.raw => {
                self.update_entry(&mut tx, &record, &entry).await?
            }
            Some(record) if let Some(time_entry_id) = record.time_entry_id => {
                self.get_entry(&mut tx, time_entry_id).await?
            }
            Some(record) => {
                tracing::warn!(id = ?record.id, "sync_record: time entry registered as custom field");
                self.insert_entry(&mut tx, integration, &entry).await?
            }
        };

        tx.commit().await?;
        Ok(time_entry)
    }

    async fn get_entry(
        &self,
        tx: &mut Transaction<'_, Postgres>,
        id: Uuid,
    ) -> Result<TimeEntry, sqlx::Error> {
        sqlx::query_as::<_, TimeEntry>("SELECT * FROM time_entries WHERE id = $1")
            .bind(id)
            .fetch_one(&mut **tx)
            .await
    }

    async fn insert_entry(
        &self,
        tx: &mut Transaction<'_, Postgres>,
        integration: &Integration,
        entry: &ProviderTimeEntry,
    ) -> Result<TimeEntry, sqlx::Error> {
        let time_entry = sqlx::query_as::<_, TimeEntry>(
            "INSERT INTO time_entries (user_id, time_started, time_ended, description, billable, custom_fields)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *",
        )
        .bind(integration.user_id)
        .bind(entry.time_started)
        .bind(entry.time_ended)
        .bind(entry.description.as_deref())
        .bind(entry.billable)
        .bind(serde_json::json!({}))
        .fetch_one(&mut **tx)
        .await?;

        sqlx::query_as::<_, SyncRecord>(
            "INSERT INTO sync_records (time_entry_id, integration_id, entity, external_id, data)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *",
        )
        .bind(time_entry.id)
        .bind(integration.id)
        .bind(entry.entity)
        .bind(&entry.external_id)
        .bind(&entry.raw)
        .fetch_one(&mut **tx)
        .await?;

        Ok(time_entry)
    }

    async fn update_entry(
        &self,
        tx: &mut Transaction<'_, Postgres>,
        record: &SyncRecord,
        entry: &ProviderTimeEntry,
    ) -> Result<TimeEntry, sqlx::Error> {
        let time_entry = sqlx::query_as::<_, TimeEntry>(
            "UPDATE time_entries
             SET time_started = $2, time_ended = $3, description = $4, billable = $5
             WHERE id = $1
             RETURNING *",
        )
        .bind(record.time_entry_id)
        .bind(entry.time_started)
        .bind(entry.time_ended)
        .bind(entry.description.as_deref())
        .bind(entry.billable)
        .fetch_one(&mut **tx)
        .await?;

        sqlx::query_as::<_, SyncRecord>(
            "UPDATE sync_records SET data = $2 WHERE id = $1 RETURNING *",
        )
        .bind(record.id)
        .bind(&entry.raw)
        .fetch_one(&mut **tx)
        .await?;

        Ok(time_entry)
    }

    /// Sync records for a mapping's (integration, entity) that already have a linked time entry —
    /// the set a mapping's field_mappings can be re-applied to.
    pub async fn find_synced_time_entry_records(
        &self,
        integration_id: Uuid,
        entity: SyncEntity,
    ) -> Result<Vec<SyncRecord>, sqlx::Error> {
        sqlx::query_as::<_, SyncRecord>(
            "SELECT * FROM sync_records
             WHERE integration_id = $1 AND entity = $2 AND time_entry_id IS NOT NULL",
        )
        .bind(integration_id)
        .bind(entity)
        .fetch_all(&self.database.pool)
        .await
    }

    /// Writes recomputed fields onto an existing time entry. Returns `None` (no write) when
    /// the recomputed values are identical to what's already stored.
    pub async fn update_time_entry_derived_fields(
        &self,
        time_entry_id: Uuid,
        fields: &DerivedTimeEntryFields,
    ) -> Result<Option<TimeEntry>, sqlx::Error> {
        sqlx::query_as::<_, TimeEntry>(
            "UPDATE time_entries
             SET time_started = $2, time_ended = $3, description = $4, billable = $5
             WHERE id = $1
               AND (time_started, time_ended, description, billable)
                   IS DISTINCT FROM ($2, $3, $4, $5)
             RETURNING *",
        )
        .bind(time_entry_id)
        .bind(fields.time_started)
        .bind(fields.time_ended)
        .bind(fields.description.as_deref())
        .bind(fields.billable)
        .fetch_optional(&self.database.pool)
        .await
    }

    pub async fn process_reference_entry(
        &self,
        integration: &Integration,
        custom_field_id: Uuid,
        entry: ProviderReferenceEntry,
    ) -> Result<Option<CustomFieldValue>, sqlx::Error> {
        let mut tx = self.database.pool.begin().await?;

        let record = sqlx::query_as::<_, SyncRecord>(
            "SELECT sync_records.* FROM sync_records
             WHERE custom_field_value_id IS NOT NULL
               AND integration_id = $1
               AND entity = $2
               AND external_id = $3",
        )
        .bind(integration.id)
        .bind(entry.entity)
        .bind(&entry.external_id)
        .fetch_optional(&mut *tx)
        .await?;

        let value = match record {
            None => {
                self.insert_or_link_custom_field_value(
                    &mut tx,
                    integration,
                    custom_field_id,
                    &entry,
                )
                .await?
            }
            Some(record) if record.data != entry.raw => Some(
                self.update_custom_field_value(&mut tx, &record, &entry)
                    .await?,
            ),
            Some(record) if let Some(value_id) = record.custom_field_value_id => {
                Some(self.get_custom_field_value(&mut tx, value_id).await?)
            }
            Some(record) => {
                tracing::warn!(id = ?record.id, "sync_record: custom field value registered as time entry");
                self.insert_or_link_custom_field_value(
                    &mut tx,
                    integration,
                    custom_field_id,
                    &entry,
                )
                .await?
            }
        };

        tx.commit().await?;
        Ok(value)
    }

    /// Merge-key lookup (any integration) if `entry.key` is set, else always creates a new value.
    async fn insert_or_link_custom_field_value(
        &self,
        tx: &mut Transaction<'_, Postgres>,
        integration: &Integration,
        custom_field_id: Uuid,
        entry: &ProviderReferenceEntry,
    ) -> Result<Option<CustomFieldValue>, sqlx::Error> {
        let existing = match &entry.key {
            Some(key) => {
                sqlx::query_as::<_, CustomFieldValue>(
                    "SELECT * FROM custom_field_values WHERE custom_field_id = $1 AND key = $2",
                )
                .bind(custom_field_id)
                .bind(key)
                .fetch_optional(&mut **tx)
                .await?
            }
            None => None,
        };

        let value = match existing {
            Some(value) => value,
            None => {
                let Some(label) = entry.label.clone() else {
                    tracing::warn!(
                        external_id = %entry.external_id,
                        "custom field mapping produced no label for a new value — skipping"
                    );
                    return Ok(None);
                };

                sqlx::query_as::<_, CustomFieldValue>(
                    "INSERT INTO custom_field_values (custom_field_id, label, key, metadata)
                     VALUES ($1, $2, $3, $4)
                     RETURNING *",
                )
                .bind(custom_field_id)
                .bind(label)
                .bind(&entry.key)
                .bind(&entry.metadata)
                .fetch_one(&mut **tx)
                .await?
            }
        };

        sqlx::query_as::<_, SyncRecord>(
            "INSERT INTO sync_records (custom_field_value_id, integration_id, entity, external_id, data)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *",
        )
        .bind(value.id)
        .bind(integration.id)
        .bind(entry.entity)
        .bind(&entry.external_id)
        .bind(&entry.raw)
        .fetch_one(&mut **tx)
        .await?;

        Ok(Some(value))
    }

    async fn get_custom_field_value(
        &self,
        tx: &mut Transaction<'_, Postgres>,
        id: Uuid,
    ) -> Result<CustomFieldValue, sqlx::Error> {
        sqlx::query_as::<_, CustomFieldValue>("SELECT * FROM custom_field_values WHERE id = $1")
            .bind(id)
            .fetch_one(&mut **tx)
            .await
    }

    async fn update_custom_field_value(
        &self,
        tx: &mut Transaction<'_, Postgres>,
        record: &SyncRecord,
        entry: &ProviderReferenceEntry,
    ) -> Result<CustomFieldValue, sqlx::Error> {
        let value = sqlx::query_as::<_, CustomFieldValue>(
            "UPDATE custom_field_values
             SET label = COALESCE($2, label), metadata = $3
             WHERE id = $1
             RETURNING *",
        )
        .bind(record.custom_field_value_id)
        .bind(&entry.label)
        .bind(&entry.metadata)
        .fetch_one(&mut **tx)
        .await?;

        sqlx::query_as::<_, SyncRecord>(
            "UPDATE sync_records SET data = $2 WHERE id = $1 RETURNING *",
        )
        .bind(record.id)
        .bind(&entry.raw)
        .fetch_one(&mut **tx)
        .await?;

        Ok(value)
    }
}
