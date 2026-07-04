import { Request, Response, NextFunction } from 'express';
import { findUserByUsername } from '../repositories/user.repository';
import { getSocialLinksByUserId } from '../repositories/social-links.repository';
import { getCreatorByUserId } from '../repositories/creator.repository';

export async function handleGetPublicProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username } = req.params as { username: string };
    const user = await findUserByUsername(username);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
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
        is_creator: !!creator,
        creator_bio: creator?.bio ?? null,
        creator_since: creator?.created_at ?? null,
        creator_min_price: creator?.min_price_per_message ?? null,
        creator_verified_at: creator?.verified_at ?? null,
      },
      links,
    });
  } catch (err) {
    next(err);
  }
}
