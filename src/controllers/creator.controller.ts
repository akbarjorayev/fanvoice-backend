import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { becomeCreator, updateCreator } from '../repositories/creator.repository';
import { requireCreator } from '../services/creator.service';
import { CREATOR_PRICE_STEP, CREATOR_MAX_PRICE } from '../constants/pricing';
import { ERROR_CODES } from '../constants/error-codes';

export async function handleBecomeCreator(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const bio = typeof req.body?.bio === 'string' ? req.body.bio.trim() : undefined;
    const creator = await becomeCreator(req.user!.id, bio || undefined);
    res.status(200).json({ creator });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateCreator(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await requireCreator(req.user!.id);

    const params: { bio?: string; min_price_per_message?: number } = {};

    if (typeof req.body?.bio === 'string') {
      params.bio = req.body.bio.trim();
    }
    if (typeof req.body?.min_price_per_message === 'number') {
      const price = req.body.min_price_per_message;
      if (!Number.isInteger(price) || price < 0) {
        res.status(400).json({ code: ERROR_CODES.CREATOR_PRICE_INVALID });
        return;
      }
      if (price > 0 && price % CREATOR_PRICE_STEP !== 0) {
        res.status(400).json({ code: ERROR_CODES.CREATOR_PRICE_STEP, params: { step: CREATOR_PRICE_STEP } });
        return;
      }
      if (price > CREATOR_MAX_PRICE) {
        res.status(400).json({ code: ERROR_CODES.CREATOR_PRICE_MAX, params: { max: CREATOR_MAX_PRICE } });
        return;
      }
      params.min_price_per_message = price;
    }

    const creator = await updateCreator(req.user!.id, params);
    res.status(200).json({ creator });
  } catch (err) {
    next(err);
  }
}
