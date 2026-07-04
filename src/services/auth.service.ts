import * as bcrypt from 'bcrypt';
import { findAuthAccount, createAuthAccount } from '../repositories/auth-account.repository';
import { findUserByEmail, findUserById, createUser } from '../repositories/user.repository';
import { getCredentials, createCredentials, updateCredentials } from '../repositories/credentials.repository';
import { exchangeCodeForProfile } from './google.service';
import { generateAccessToken } from './token.service';
import { User } from '../types';

const SALT_ROUNDS = 12;

interface AuthResult {
  user: User;
  accessToken: string;
}

export async function googleSignIn(code: string): Promise<AuthResult> {
  const profile = await exchangeCodeForProfile(code);

  const existingAccount = await findAuthAccount('google', profile.googleUserId);

  if (existingAccount) {
    const user = await findUserById(existingAccount.user_id);
    if (!user) throw new Error('User associated with account not found');
    return { user, accessToken: generateAccessToken(user) };
  }

  const existingUser = await findUserByEmail(profile.email);

  if (existingUser) {
    await createAuthAccount({
      userId: existingUser.id,
      provider: 'google',
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
    provider: 'google',
    providerUserId: profile.googleUserId,
  });

  return { user: newUser, accessToken: generateAccessToken(newUser) };
}

export async function emailSignUp(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await createUser({ email: normalizedEmail, avatarUrl: null });

  await createAuthAccount({ userId: newUser.id, provider: 'password', providerUserId: null });
  await createCredentials(newUser.id, passwordHash);

  return { user: newUser, accessToken: generateAccessToken(newUser) };
}

export async function emailSignIn(email: string, password: string): Promise<AuthResult> {
  const user = await findUserByEmail(email.trim().toLowerCase());
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const credentials = await getCredentials(user.id);
  if (!credentials) {
    throw new Error('This account uses Google Sign-In. Please continue with Google.');
  }

  const valid = await bcrypt.compare(password, credentials.password_hash);
  if (!valid) {
    throw new Error('Invalid email or password');
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
    throw new Error('No password is set for this account');
  }

  const valid = await bcrypt.compare(currentPassword, credentials.password_hash);
  if (!valid) {
    throw new Error('Current password is incorrect');
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await updateCredentials(userId, newHash);
}
