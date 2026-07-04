CREATE TABLE social_links (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  platform TEXT NOT NULL,
  url TEXT NOT NULL,

  PRIMARY KEY (user_id, platform)
);
