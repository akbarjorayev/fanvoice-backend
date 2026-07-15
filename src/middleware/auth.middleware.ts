import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/token.service';
import { findUserById } from '../repositories/user.repository';
import { AuthenticatedRequest } from '../types';
import { SESSION_COOKIE } from '../constants/cookies';
import { USER_NOT_FOUND } from '../constants/messages';

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await findUserById(payload.sub);
    if (!user) {
      res.status(401).json({ message: USER_NOT_FOUND });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
