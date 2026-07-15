import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  getSocialLinksByUserId,
  upsertSocialLink,
  deleteSocialLink,
} from '../repositories/social-links.repository';
import { requireCreator } from '../services/creator.service';
import { parsePlatformOrThrow, upsertSocialLinkSchema, validatePlatformUrl } from '../validators/social-links.validator';

export async function handleGetSocialLinks(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const links = await getSocialLinksByUserId(req.user!.id);
    res.status(200).json({ links });
  } catch (err) {
    next(err);
  }
}

export async function handleUpsertSocialLink(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await requireCreator(req.user!.id, 'Only creators can add social links');

    const platform = parsePlatformOrThrow(req.params.platform);
    const bodyParsed = upsertSocialLinkSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ message: bodyParsed.error.issues[0]?.message ?? 'Invalid URL' });
      return;
    }
    const { url } = bodyParsed.data;
    const domainError = validatePlatformUrl(platform, url);
    if (domainError) {
      res.status(400).json({ message: domainError });
      return;
    }
    const link = await upsertSocialLink(req.user!.id, platform, url);
    res.status(200).json({ link });
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteSocialLink(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const platform = parsePlatformOrThrow(req.params.platform);
    await deleteSocialLink(req.user!.id, platform);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
