import { findUserByUsername, updateUser } from '../repositories/user.repository';
import { User } from '../types';

function conflict(message: string): Error {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = 409;
  return err;
}

export async function updateProfile(
  userId: string,
  params: { display_name?: string; username?: string },
): Promise<User> {
  if (params.username !== undefined) {
    const taken = await findUserByUsername(params.username, userId);
    if (taken) throw conflict('Username is already taken');
  }

  const updated = await updateUser(userId, params);
  if (!updated) {
    const err = new Error('User not found') as Error & { statusCode: number };
    err.statusCode = 404;
    throw err;
  }

  return updated;
}
