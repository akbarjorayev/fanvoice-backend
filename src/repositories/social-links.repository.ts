import { db } from '../config/database';
import { SocialLink } from '../types';

export async function getSocialLinksByUserId(userId: string): Promise<SocialLink[]> {
  const result = await db.query<SocialLink>(
    'SELECT * FROM social_links WHERE user_id = $1 ORDER BY platform',
    [userId],
  );
  return result.rows;
}

export async function upsertSocialLink(
  userId: string,
  platform: string,
  url: string,
): Promise<SocialLink> {
  const result = await db.query<SocialLink>(
    `INSERT INTO social_links (user_id, platform, url)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, platform) DO UPDATE SET url = EXCLUDED.url
     RETURNING *`,
    [userId, platform, url],
  );
  return result.rows[0];
}

export async function deleteSocialLink(userId: string, platform: string): Promise<void> {
  await db.query(
    'DELETE FROM social_links WHERE user_id = $1 AND platform = $2',
    [userId, platform],
  );
}
