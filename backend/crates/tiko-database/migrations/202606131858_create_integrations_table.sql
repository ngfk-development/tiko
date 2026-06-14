CREATE TYPE provider AS ENUM (
    'harvest',
    'moneybird',
    'simplicate'
);

CREATE TYPE auth_type AS ENUM (
    'personal_access_token',
    'oauth2'
);

CREATE TABLE integrations (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider         provider    NOT NULL,
    auth_type        auth_type   NOT NULL,
    auth_data        JSONB       NOT NULL DEFAULT '{}',
    token_expires_at TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER integrations_set_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX ON integrations (user_id);
