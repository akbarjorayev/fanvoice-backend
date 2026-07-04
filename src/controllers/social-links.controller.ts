import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  getSocialLinksByUserId,
  upsertSocialLink,
  deleteSocialLink,
} from '../repositories/social-links.repository';
import { getCreatorByUserId } from '../repositories/creator.repository';
import { platformParamSchema, upsertSocialLinkSchema, validatePlatformUrl } from '../validators/social-links.validator';

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
    const creator = await getCreatorByUserId(req.user!.id);
    if (!creator) {
      res.status(403).json({ message: 'Only creators can add social links' });
      return;
    }

    const parsed = platformParamSchema.safeParse(req.params.platform);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid platform' });
      return;
    }
    const bodyParsed = upsertSocialLinkSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ message: bodyParsed.error.issues[0]?.message ?? 'Invalid URL' });
      return;
    }
    const { url } = bodyParsed.data;
    const domainError = validatePlatformUrl(parsed.data, url);
    if (domainError) {
      res.status(400).json({ message: domainError });
      return;
    }
    const link = await upsertSocialLink(req.user!.id, parsed.data, url);
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
    const parsed = platformParamSchema.safeParse(req.params.platform);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid platform' });
      return;
    }
    await deleteSocialLink(req.user!.id, parsed.data);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
