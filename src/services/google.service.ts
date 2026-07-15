import { googleClient, GOOGLE_CLIENT_ID } from '../config/google';
import { httpError } from '../middleware/error.middleware';
import { GoogleProfile } from '../types';

export async function exchangeCodeForProfile(code: string): Promise<GoogleProfile> {
  const { tokens } = await googleClient.getToken({ code, redirect_uri: 'postmessage' });
  if (!tokens.id_token) throw httpError('No id_token received from Google', 400);
  return verifyGoogleToken(tokens.id_token);
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleProfile> {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw httpError('Invalid Google token: empty payload', 400);
  }

  const { sub, email, name, picture } = payload;

  if (!sub || !email || !name) {
    throw httpError('Invalid Google token: missing required fields', 400);
  }

  return {
    googleUserId: sub,
    email,
    displayName: name,
    avatarUrl: picture ?? null,
  };
}
