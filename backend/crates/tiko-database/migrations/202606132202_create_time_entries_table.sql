CREATE TABLE time_entries (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    time_started  TIMESTAMPTZ NOT NULL,
    time_ended    TIMESTAMPTZ,
    description   TEXT,
    billable      BOOLEAN     NOT NULL DEFAULT false,
    custom_fields JSONB       NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER time_entries_set_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX ON time_entries (user_id);
