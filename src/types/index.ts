import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  created_at: Date;
  deleted_at: Date | null;
}

export interface Creator {
  user_id: string;
  bio: string | null;
  min_price_per_message: number;
  created_at: Date;
  verified_at: Date | null;
}

export interface SocialLink {
  user_id: string;
  platform: string;
  url: string;
}

export interface AuthAccount {
  user_id: string;
  provider: 'google' | 'password';
  provider_user_id: string | null;
}

export interface GoogleProfile {
  googleUserId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Message {
  id: string;
  fan_id: string;
  creator_id: string;
  title: string;
  message: string;
  price: number;
  created_at: Date;
  read_at: Date | null;
}

export interface JwtPayload {
  sub: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}
