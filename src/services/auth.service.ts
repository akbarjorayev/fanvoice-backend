import * as bcrypt from 'bcrypt';
import { findAuthAccount, createAuthAccount } from '../repositories/auth-account.repository';
import { findUserByEmail, findUserById, createUser } from '../repositories/user.repository';
import { getCredentials, createCredentials, updateCredentials } from '../repositories/credentials.repository';
import { exchangeCodeForProfile } from './google.service';
import { generateAccessToken } from './token.service';
import { httpError } from '../middleware/error.middleware';
import { AUTH_PROVIDER_GOOGLE, AUTH_PROVIDER_PASSWORD } from '../constants/auth';
import { ERROR_CODES } from '../constants/error-codes';
import { User } from '../types';

const SALT_ROUNDS = 12;

interface AuthResult {
  user: User;
  accessToken: string;
}

export async function googleSignIn(code: string): Promise<AuthResult> {
  const profile = await exchangeCodeForProfile(code);

  const existingAccount = await findAuthAccount(AUTH_PROVIDER_GOOGLE, profile.googleUserId);

  if (existingAccount) {
    const user = await findUserById(existingAccount.user_id);
    if (!user) throw new Error('User associated with account not found');
    return { user, accessToken: generateAccessToken(user) };
  }

  const existingUser = await findUserByEmail(profile.email);

  if (existingUser) {
    await createAuthAccount({
      userId: existingUser.id,
      provider: AUTH_PROVIDER_GOOGLE,
      providerUserId: profile.googleUserId,
    });
    return { user: existingUser, accessToken: generateAccessToken(existingUser) };
  }

  const newUser = await createUser({
    email: profile.email,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
  });

  await createAuthAccount({
    userId: newUser.id,
    provider: AUTH_PROVIDER_GOOGLE,
    providerUserId: profile.googleUserId,
  });

  return { user: newUser, accessToken: generateAccessToken(newUser) };
}

export async function emailSignUp(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw httpError(ERROR_CODES.AUTH_EMAIL_TAKEN, 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await createUser({ email: normalizedEmail, avatarUrl: null });

  await createAuthAccount({ userId: newUser.id, provider: AUTH_PROVIDER_PASSWORD, providerUserId: null });
  await createCredentials(newUser.id, passwordHash);

  return { user: newUser, accessToken: generateAccessToken(newUser) };
}

export async function emailSignIn(email: string, password: string): Promise<AuthResult> {
  const user = await findUserByEmail(email.trim().toLowerCase());
  if (!user) {
    throw httpError(ERROR_CODES.AUTH_INVALID_CREDENTIALS, 401);
  }

  const credentials = await getCredentials(user.id);
  if (!credentials) {
    throw httpError(ERROR_CODES.AUTH_USES_GOOGLE, 400);
  }

  const valid = await bcrypt.compare(password, credentials.password_hash);
  if (!valid) {
    throw httpError(ERROR_CODES.AUTH_INVALID_CREDENTIALS, 401);
  }

  return { user, accessToken: generateAccessToken(user) };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const credentials = await getCredentials(userId);
  if (!credentials) {
    throw httpError(ERROR_CODES.AUTH_NO_PASSWORD_SET, 400);
  }

  const valid = await bcrypt.compare(currentPassword, credentials.password_hash);
  if (!valid) {
    throw httpError(ERROR_CODES.AUTH_CURRENT_PASSWORD_INCORRECT, 401);
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await updateCredentials(userId, newHash);
}
