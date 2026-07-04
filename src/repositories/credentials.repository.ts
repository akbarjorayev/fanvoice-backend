import { db } from '../config/database';

interface Credentials {
  user_id: string;
  password_hash: string;
}

export async function getCredentials(userId: string): Promise<Credentials | null> {
  const result = await db.query<Credentials>(
    'SELECT * FROM credentials WHERE user_id = $1',
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function createCredentials(userId: string, passwordHash: string): Promise<void> {
  await db.query(
    'INSERT INTO credentials (user_id, password_hash) VALUES ($1, $2)',
    [userId, passwordHash],
  );
}

export async function updateCredentials(userId: string, passwordHash: string): Promise<void> {
  await db.query(
    'UPDATE credentials SET password_hash = $1 WHERE user_id = $2',
    [passwordHash, userId],
  );
}

export async function userHasPassword(userId: string): Promise<boolean> {
  const result = await db.query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM credentials WHERE user_id = $1) AS exists',
    [userId],
  );
  return result.rows[0].exists;
}
