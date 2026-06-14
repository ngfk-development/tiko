CREATE TABLE sync_records (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    time_entry_id         UUID        REFERENCES time_entries(id) ON DELETE CASCADE,
    custom_field_value_id UUID        REFERENCES custom_field_values(id) ON DELETE CASCADE,
    integration_id        UUID        NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    entity                sync_entity NOT NULL,
    external_id           TEXT,
    data                  JSONB       NOT NULL DEFAULT '{}',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (integration_id, external_id)
);

CREATE INDEX ON sync_records (integration_id, entity);

CREATE UNIQUE INDEX ON sync_records (time_entry_id, integration_id)
    WHERE time_entry_id IS NOT NULL;

CREATE UNIQUE INDEX ON sync_records (custom_field_value_id, integration_id)
    WHERE custom_field_value_id IS NOT NULL;

CREATE TRIGGER sync_records_set_updated_at
    BEFORE UPDATE ON sync_records
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE sync_records ADD CONSTRAINT sync_records_single_target CHECK (
    (time_entry_id IS NOT NULL)::int + (custom_field_value_id IS NOT NULL)::int = 1
);
