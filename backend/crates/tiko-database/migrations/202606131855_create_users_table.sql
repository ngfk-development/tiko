CREATE TABLE users (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email          TEXT        NOT NULL UNIQUE,
    email_verified BOOLEAN     NOT NULL DEFAULT false,
    first_name     TEXT        NOT NULL,
    last_name      TEXT        NOT NULL,
    password_hash  TEXT        NOT NULL,
    admin          BOOLEAN     NOT NULL DEFAULT false,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
