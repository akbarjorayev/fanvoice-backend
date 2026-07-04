import { googleClient } from '../config/google';
import { GoogleProfile } from '../types';

export async function exchangeCodeForProfile(code: string): Promise<GoogleProfile> {
  const { tokens } = await googleClient.getToken({ code, redirect_uri: 'postmessage' });
  if (!tokens.id_token) throw new Error('No id_token received from Google');
  return verifyGoogleToken(tokens.id_token);
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleProfile> {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid Google token: empty payload');
  }

  const { sub, email, name, picture } = payload;

  if (!sub || !email || !name) {
    throw new Error('Invalid Google token: missing required fields');
  }

  return {
    googleUserId: sub,
    email,
    displayName: name,
    avatarUrl: picture ?? null,
  };
}
