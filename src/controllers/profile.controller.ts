import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { updateProfile } from '../services/profile.service';
import { userHasPassword } from '../repositories/credentials.repository';
import { getCreatorByUserId } from '../repositories/creator.repository';

export async function handleGetProfile(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const [hasPassword, creator] = await Promise.all([
    userHasPassword(req.user!.id),
    getCreatorByUserId(req.user!.id),
  ]);
  res.status(200).json({
    user: {
      ...req.user,
      has_password: hasPassword,
      is_creator: !!creator,
      creator_bio: creator?.bio ?? null,
      creator_since: creator?.created_at ?? null,
      creator_min_price: creator?.min_price_per_message ?? null,
      creator_verified_at: creator?.verified_at ?? null,
    },
  });
}

export async function handleUpdateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await updateProfile(req.user!.id, req.body);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
