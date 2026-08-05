import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  getSocialLinksByUserId,
  upsertSocialLink,
  deleteSocialLink,
} from '../repositories/social-links.repository';
import { requireCreator } from '../services/creator.service';
import { parsePlatformOrThrow, upsertSocialLinkSchema, validatePlatformUrl } from '../validators/social-links.validator';
import { ERROR_CODES } from '../constants/error-codes';

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
    await requireCreator(req.user!.id, ERROR_CODES.SOCIAL_LINKS_CREATOR_ONLY);

    const platform = parsePlatformOrThrow(req.params.platform);
    const bodyParsed = upsertSocialLinkSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ code: bodyParsed.error.issues[0]?.message ?? ERROR_CODES.SOCIAL_LINK_INVALID_URL });
      return;
    }
    const { url } = bodyParsed.data;
    const domainMismatch = validatePlatformUrl(platform, url);
    if (domainMismatch) {
      res.status(400).json({ code: ERROR_CODES.SOCIAL_LINK_DOMAIN_MISMATCH, params: { platform } });
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
