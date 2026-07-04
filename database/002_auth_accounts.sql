CREATE TYPE auth_provider AS ENUM ('google', 'password');

CREATE TABLE auth_accounts (
  user_id          UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider         auth_provider  NOT NULL,
  provider_user_id TEXT,

  PRIMARY KEY (user_id, provider)
);
