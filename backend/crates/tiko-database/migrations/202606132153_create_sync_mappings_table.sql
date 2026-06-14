CREATE TYPE sync_direction AS ENUM (
    'read',
    'write'
);

CREATE TYPE sync_entity AS ENUM (
    'harvest_time_entry',
    'harvest_project',
    'harvest_task',
    'harvest_client'
);

CREATE TYPE sync_trigger AS ENUM (
    'automatic',
    'cron',
    'manual'
);

CREATE TABLE sync_mappings (
    id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id   UUID           NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    direction        sync_direction NOT NULL,
    entity           sync_entity    NOT NULL,
    trigger          sync_trigger   NOT NULL,
    trigger_metadata JSONB          NOT NULL DEFAULT '{}',
    filter_rules     JSONB          NOT NULL DEFAULT '{}',
    field_mappings   JSONB          NOT NULL DEFAULT '{}',
    active           BOOLEAN        NOT NULL DEFAULT true,
    sync_state       JSONB          NOT NULL DEFAULT '{}',
    last_synced_at   TIMESTAMPTZ,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX ON sync_mappings (integration_id, entity)
    WHERE direction = 'read';

CREATE TRIGGER sync_mappings_set_updated_at
    BEFORE UPDATE ON sync_mappings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
