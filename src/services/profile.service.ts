import { findUserByUsername, updateUser } from '../repositories/user.repository';
import { httpError } from '../middleware/error.middleware';
import { USER_NOT_FOUND } from '../constants/messages';
import { User } from '../types';

export async function updateProfile(
  userId: string,
  params: { display_name?: string; username?: string },
): Promise<User> {
  if (params.username !== undefined) {
    const taken = await findUserByUsername(params.username, userId);
    if (taken) throw httpError('Username is already taken', 409);
  }

  const updated = await updateUser(userId, params);
  if (!updated) {
    throw httpError(USER_NOT_FOUND, 404);
  }

  return updated;
}
