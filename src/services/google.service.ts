import { googleClient, GOOGLE_CLIENT_ID } from '../config/google';
import { httpError } from '../middleware/error.middleware';
import { ERROR_CODES } from '../constants/error-codes';
import { GoogleProfile } from '../types';

export async function exchangeCodeForProfile(code: string): Promise<GoogleProfile> {
  const { tokens } = await googleClient.getToken({ code, redirect_uri: 'postmessage' });
  if (!tokens.id_token) throw httpError(ERROR_CODES.AUTH_GOOGLE_NO_ID_TOKEN, 400);
  return verifyGoogleToken(tokens.id_token);
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleProfile> {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw httpError(ERROR_CODES.AUTH_GOOGLE_EMPTY_PAYLOAD, 400);
  }

  const { sub, email, name, picture } = payload;

  if (!sub || !email || !name) {
    throw httpError(ERROR_CODES.AUTH_GOOGLE_MISSING_FIELDS, 400);
  }

  return {
    googleUserId: sub,
    email,
    displayName: name,
    avatarUrl: picture ?? null,
  };
}
