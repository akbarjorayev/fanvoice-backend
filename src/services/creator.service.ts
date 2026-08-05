import { getCreatorByUserId } from '../repositories/creator.repository';
import { httpError } from '../middleware/error.middleware';
import { ERROR_CODES, ErrorCode } from '../constants/error-codes';
import { Creator } from '../types';

export async function requireCreator(
  userId: string,
  code: ErrorCode = ERROR_CODES.NOT_A_CREATOR,
): Promise<Creator> {
  const creator = await getCreatorByUserId(userId);
  if (!creator) throw httpError(code, 403);
  return creator;
}
