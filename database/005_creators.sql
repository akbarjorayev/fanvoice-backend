CREATE TABLE creators (
  user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio                 TEXT,
  min_price_per_message INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at         TIMESTAMPTZ DEFAULT NULL
);
