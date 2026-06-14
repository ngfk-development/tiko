CREATE TYPE sync_issue_status AS ENUM (
    'open',
    'resolved',
    'skipped'
);

CREATE TYPE sync_issue_kind AS ENUM (
    'missing_field',
    'write_conflict'
);

CREATE TABLE sync_issues (
    id                    UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id        UUID              NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    sync_mapping_id       UUID              REFERENCES sync_mappings(id) ON DELETE SET NULL,
    time_entry_id         UUID              REFERENCES time_entries(id) ON DELETE CASCADE,
    custom_field_value_id UUID              REFERENCES custom_field_values(id) ON DELETE CASCADE,
    status                sync_issue_status NOT NULL DEFAULT 'open',
    kind                  sync_issue_kind   NOT NULL,
    raw_data              JSONB             NOT NULL,
    context               JSONB,
    resolved_at           TIMESTAMPTZ,
    created_at            TIMESTAMPTZ       NOT NULL DEFAULT now()
);

ALTER TABLE sync_issues ADD CONSTRAINT sync_issues_at_most_one_target CHECK (
    (time_entry_id IS NOT NULL)::int + (custom_field_value_id IS NOT NULL)::int <= 1
);

CREATE INDEX ON sync_issues (integration_id, status);
