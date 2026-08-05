import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/token.service';
import { findUserById } from '../repositories/user.repository';
import { AuthenticatedRequest } from '../types';
import { SESSION_COOKIE } from '../constants/cookies';
import { ERROR_CODES } from '../constants/error-codes';

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    res.status(401).json({ code: ERROR_CODES.NOT_AUTHENTICATED });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await findUserById(payload.sub);
    if (!user) {
      res.status(401).json({ code: ERROR_CODES.USER_NOT_FOUND });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ code: ERROR_CODES.TOKEN_INVALID });
  }
}
