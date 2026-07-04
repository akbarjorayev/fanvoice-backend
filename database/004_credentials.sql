CREATE TABLE credentials (
  user_id       UUID  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT  NOT NULL,

  PRIMARY KEY (user_id)
);
