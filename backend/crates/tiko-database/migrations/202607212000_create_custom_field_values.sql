CREATE TABLE custom_field_values (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_field_id UUID        NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
    label           TEXT        NOT NULL,
    key             TEXT,
    metadata        JSONB       NOT NULL DEFAULT '{}',
    parent_id       UUID        REFERENCES custom_field_values(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (id != parent_id)
);

CREATE TRIGGER custom_field_values_set_updated_at
    BEFORE UPDATE ON custom_field_values
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX ON custom_field_values (custom_field_id);

CREATE INDEX ON custom_field_values (custom_field_id, key)
    WHERE key IS NOT NULL;

CREATE INDEX ON custom_field_values (parent_id)
    WHERE parent_id IS NOT NULL;
