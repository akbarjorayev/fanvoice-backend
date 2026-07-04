import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { JwtPayload, User } from '../types';

export function generateAccessToken(user: User): string {
  const payload: JwtPayload = { sub: user.id };
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, jwtConfig.secret) as JwtPayload;
}
