import { Request, Response, NextFunction } from 'express';
import { findUserByUsername } from '../repositories/user.repository';
import { getSocialLinksByUserId } from '../repositories/social-links.repository';
import { getCreatorByUserId, creatorFields } from '../repositories/creator.repository';
import { ERROR_CODES } from '../constants/error-codes';

export async function handleGetPublicProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username } = req.params as { username: string };
    const user = await findUserByUsername(username);

    if (!user) {
      res.status(404).json({ code: ERROR_CODES.USER_NOT_FOUND });
      return;
    }

    const [links, creator] = await Promise.all([
      getSocialLinksByUserId(user.id),
      getCreatorByUserId(user.id),
    ]);

    // Never expose email on public endpoints
    res.status(200).json({
      user: {
        id: user.id,
        display_name: user.display_name,
        username: user.username,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        ...creatorFields(creator),
      },
      links,
    });
  } catch (err) {
    next(err);
  }
}
