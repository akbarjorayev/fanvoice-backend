CREATE TABLE users (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  email        TEXT        NOT NULL UNIQUE,
  display_name TEXT        NOT NULL DEFAULT 'New User',
  username     TEXT        NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),

  avatar_url   TEXT,
  verified     BOOLEAN     DEFAULT FALSE,

  deleted_at   TIMESTAMP   NULL,
  created_at   TIMESTAMP   NOT NULL DEFAULT NOW()
);
