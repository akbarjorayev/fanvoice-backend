import { z } from 'zod';

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

export function validatePlatformUrl(platform: Platform, url: string): string | null {
  const rule = DOMAIN_RULES[platform];
  if (rule && !rule.test(url)) {
    return `URL does not match the expected domain for platform "${platform}"`;
  }
  return null;
}

export const upsertSocialLinkSchema = z.object({
  url: z.string().url('Must be a valid URL').max(500, 'URL is too long'),
});

export const platformParamSchema = z.enum(PLATFORMS);

export type UpsertSocialLinkInput = z.infer<typeof upsertSocialLinkSchema>;
