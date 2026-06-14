CREATE TABLE custom_fields (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    description TEXT,
    icon        TEXT        NOT NULL DEFAULT 'tag',
    position    INT         NOT NULL DEFAULT 0,
    parent_id   UUID        REFERENCES custom_fields(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, name),
    CHECK (id != parent_id)
);

CREATE TRIGGER custom_fields_set_updated_at
    BEFORE UPDATE ON custom_fields
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX ON custom_fields (user_id, position);
