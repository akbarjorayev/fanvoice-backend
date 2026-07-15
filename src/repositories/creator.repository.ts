import { db } from '../config/database';
import { Creator } from '../types';

export async function getCreatorByUserId(userId: string): Promise<Creator | null> {
  const result = await db.query<Creator>(
    'SELECT * FROM creators WHERE user_id = $1',
    [userId],
  );
  return result.rows[0] ?? null;
}

export function creatorFields(creator: Creator | null) {
  return {
    is_creator: !!creator,
    creator_bio: creator?.bio ?? null,
    creator_since: creator?.created_at ?? null,
    creator_min_price: creator?.min_price_per_message ?? null,
    creator_verified_at: creator?.verified_at ?? null,
  };
}

export async function becomeCreator(userId: string, bio?: string): Promise<Creator> {
  const result = await db.query<Creator>(
    `INSERT INTO creators (user_id, bio)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING *`,
    [userId, bio ?? null],
  );
  if (result.rows.length > 0) return result.rows[0];
  return (await getCreatorByUserId(userId))!;
}

export async function updateCreator(
  userId: string,
  params: { bio?: string; min_price_per_message?: number },
): Promise<Creator | null> {
  const fields: string[] = [];
  const values: unknown[] = [userId];

  if (params.bio !== undefined) {
    values.push(params.bio);
    fields.push(`bio = $${values.length}`);
  }
  if (params.min_price_per_message !== undefined) {
    values.push(params.min_price_per_message);
    fields.push(`min_price_per_message = $${values.length}`);
  }

  if (fields.length === 0) return getCreatorByUserId(userId);

  const result = await db.query<Creator>(
    `UPDATE creators SET ${fields.join(', ')} WHERE user_id = $1 RETURNING *`,
    values,
  );
  return result.rows[0] ?? null;
}
