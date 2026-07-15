import { db } from '../config/database';
import { AuthAccount, AuthProvider } from '../types';

export async function findAuthAccount(
  provider: AuthProvider,
  providerUserId: string,
): Promise<AuthAccount | null> {
  const result = await db.query<AuthAccount>(
    'SELECT * FROM auth_accounts WHERE provider = $1 AND provider_user_id = $2',
    [provider, providerUserId],
  );
  return result.rows[0] ?? null;
}

export async function createAuthAccount(params: {
  userId: string;
  provider: AuthProvider;
  providerUserId: string | null;
}): Promise<AuthAccount> {
  const result = await db.query<AuthAccount>(
    `INSERT INTO auth_accounts (user_id, provider, provider_user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [params.userId, params.provider, params.providerUserId],
  );
  return result.rows[0];
}
