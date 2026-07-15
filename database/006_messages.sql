CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  fan_id UUID NOT NULL REFERENCES users(id),
  creator_id UUID NOT NULL REFERENCES users(id),

  title TEXT NOT NULL,
  message TEXT NOT NULL,

  price BIGINT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at   TIMESTAMPTZ,
  paid_at   TIMESTAMPTZ,

  CHECK (fan_id != creator_id)
);
