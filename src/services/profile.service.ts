import { findUserByUsername, updateUser } from '../repositories/user.repository';
import { httpError } from '../middleware/error.middleware';
import { ERROR_CODES } from '../constants/error-codes';
import { User } from '../types';

export async function updateProfile(
  userId: string,
  params: { display_name?: string; username?: string },
): Promise<User> {
  if (params.username !== undefined) {
    const taken = await findUserByUsername(params.username, userId);
    if (taken) throw httpError(ERROR_CODES.USERNAME_TAKEN, 409);
  }

  const updated = await updateUser(userId, params);
  if (!updated) {
    throw httpError(ERROR_CODES.USER_NOT_FOUND, 404);
  }

  return updated;
}
