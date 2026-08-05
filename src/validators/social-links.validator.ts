import { z } from 'zod';
import { httpError } from '../middleware/error.middleware';
import { ERROR_CODES } from '../constants/error-codes';

export const PLATFORMS = [
  'twitter',
  'instagram',
  'youtube',
  'tiktok',
  'telegram',
  'github',
  'website',
] as const;

export type Platform = (typeof PLATFORMS)[number];

const DOMAIN_RULES: Record<Platform, RegExp | null> = {
  twitter:   /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i,
  instagram: /^https?:\/\/(www\.)?instagram\.com\//i,
  youtube:   /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i,
  tiktok:    /^https?:\/\/(www\.)?tiktok\.com\//i,
  telegram:  /^https?:\/\/(t\.me|telegram\.me|telegram\.org)\//i,
  github:    /^https?:\/\/(www\.)?github\.com\//i,
  website:   /^https?:\/\/[^\s]+\.[^\s]{2,}/i,
};

export function validatePlatformUrl(platform: Platform, url: string): boolean {
  const rule = DOMAIN_RULES[platform];
  return !!rule && !rule.test(url);
}

export const upsertSocialLinkSchema = z.object({
  url: z.string().url(ERROR_CODES.VALIDATION_URL_INVALID).max(500, ERROR_CODES.VALIDATION_URL_TOO_LONG),
});

export const platformParamSchema = z.enum(PLATFORMS);

export function parsePlatformOrThrow(raw: unknown): Platform {
  const parsed = platformParamSchema.safeParse(raw);
  if (!parsed.success) throw httpError(ERROR_CODES.SOCIAL_LINK_PLATFORM_INVALID, 400);
  return parsed.data;
}

export type UpsertSocialLinkInput = z.infer<typeof upsertSocialLinkSchema>;
