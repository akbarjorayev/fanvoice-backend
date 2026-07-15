import { getCreatorByUserId } from '../repositories/creator.repository';
import { httpError } from '../middleware/error.middleware';
import { Creator } from '../types';

export async function requireCreator(userId: string, message = 'Not a creator'): Promise<Creator> {
  const creator = await getCreatorByUserId(userId);
  if (!creator) throw httpError(message, 403);
  return creator;
}
