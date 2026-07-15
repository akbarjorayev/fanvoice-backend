import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { updateProfile } from '../services/profile.service';
import { userHasPassword } from '../repositories/credentials.repository';
import { getCreatorByUserId, creatorFields } from '../repositories/creator.repository';

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
      ...creatorFields(creator),
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
