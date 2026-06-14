CREATE TYPE job_status AS ENUM (
    'pending',
    'processing',
    'done',
    'failed'
);

CREATE TABLE sync_jobs (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_record_id UUID        NOT NULL REFERENCES sync_records(id) ON DELETE CASCADE,
    mapping_id     UUID        NOT NULL REFERENCES sync_mappings(id) ON DELETE CASCADE,
    patch          JSONB       NOT NULL DEFAULT '{}',
    status         job_status  NOT NULL DEFAULT 'pending',
    attempts       INT         NOT NULL DEFAULT 0,
    last_error     TEXT,
    scheduled_at   TIMESTAMPTZ,
    completed_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER sync_jobs_set_updated_at
    BEFORE UPDATE ON sync_jobs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX ON sync_jobs (status, scheduled_at)
    WHERE status IN ('pending', 'failed');

CREATE INDEX ON sync_jobs (sync_record_id, created_at);

CREATE INDEX ON sync_jobs (mapping_id);
