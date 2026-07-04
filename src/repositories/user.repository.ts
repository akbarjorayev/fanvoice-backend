import { db } from '../config/database';
import { User } from '../types';

export async function findUserById(id: string): Promise<User | null> {
  const result = await db.query<User>(
    'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
    [id],
  );
  return result.rows[0] ?? null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await db.query<User>(
    'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email],
  );
  return result.rows[0] ?? null;
}

export async function findUserByUsername(username: string, excludeId?: string): Promise<User | null> {
  if (excludeId) {
    const result = await db.query<User>(
      'SELECT * FROM users WHERE username = $1 AND id != $2 AND deleted_at IS NULL',
      [username, excludeId],
    );
    return result.rows[0] ?? null;
  }
  const result = await db.query<User>(
    'SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL',
    [username],
  );
  return result.rows[0] ?? null;
}

export async function updateUser(
  id: string,
  params: { display_name?: string; username?: string },
): Promise<User | null> {
  const fields: string[] = [];
  const values: unknown[] = [id];

  if (params.display_name !== undefined) {
    values.push(params.display_name);
    fields.push(`display_name = $${values.length}`);
  }
  if (params.username !== undefined) {
    values.push(params.username);
    fields.push(`username = $${values.length}`);
  }

  if (fields.length === 0) return findUserById(id);

  const result = await db.query<User>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function createUser(params: {
  email: string;
  displayName?: string | null;
  avatarUrl: string | null;
}): Promise<User> {
  if (params.displayName) {
    const result = await db.query<User>(
      `INSERT INTO users (email, display_name, avatar_url) VALUES ($1, $2, $3) RETURNING *`,
      [params.email, params.displayName, params.avatarUrl],
    );
    return result.rows[0];
  }
  // No displayName — let the DB default ('New User') take effect
  const result = await db.query<User>(
    `INSERT INTO users (email, avatar_url) VALUES ($1, $2) RETURNING *`,
    [params.email, params.avatarUrl],
  );
  return result.rows[0];
}
