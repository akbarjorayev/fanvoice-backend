import { SESSION_DURATION_MS } from '../constants/session';

export const jwtConfig = {
  secret: process.env.JWT_SECRET as string,
  expiresIn: SESSION_DURATION_MS / 1000,
};
