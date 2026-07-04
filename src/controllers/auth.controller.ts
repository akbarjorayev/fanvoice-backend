import { Response, NextFunction } from 'express';
import { googleSignIn, emailSignUp, emailSignIn, changePassword } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';

const SESSION_COOKIE = 'session';

function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: '/',
    ...(maxAge !== undefined && { maxAge }),
  };
}

function setSession(res: Response, accessToken: string) {
  res.cookie(SESSION_COOKIE, accessToken, cookieOptions(14 * 24 * 60 * 60 * 1000));
}

export async function handleGoogleSignIn(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { code } = req.body as { code: string };
    if (!code) { res.status(400).json({ message: 'Missing authorization code' }); return; }
    const { user, accessToken } = await googleSignIn(code);
    setSession(res, accessToken);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function handleEmailSignUp(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const { user, accessToken } = await emailSignUp(email, password);
    setSession(res, accessToken);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function handleEmailSignIn(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const { user, accessToken } = await emailSignIn(email, password);
    setSession(res, accessToken);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function handleChangePassword(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };
    await changePassword(req.user!.id, currentPassword, newPassword);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

export function handleGetMe(req: AuthenticatedRequest, res: Response): void {
  res.status(200).json({ user: req.user });
}

export function handleLogout(_req: AuthenticatedRequest, res: Response): void {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
  res.status(200).json({ message: 'Logged out' });
}
