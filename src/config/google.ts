import { OAuth2Client } from 'google-auth-library';
import { IS_PRODUCTION } from '../constants/env';

export const GOOGLE_CLIENT_ID = IS_PRODUCTION
  ? process.env.GOOGLE_CLIENT_ID
  : process.env.GOOGLE_CLIENT_ID_DEV;

export const GOOGLE_CLIENT_SECRET = IS_PRODUCTION
  ? process.env.GOOGLE_CLIENT_SECRET
  : process.env.GOOGLE_CLIENT_SECRET_DEV;

export const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
