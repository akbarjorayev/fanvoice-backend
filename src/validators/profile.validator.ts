import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    display_name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(30, 'Name must be at most 30 characters')
      .optional(),
    username: z
      .string()
      .min(2, 'Username must be at least 2 characters')
      .max(20, 'Username must be at most 20 characters')
      .toLowerCase()
      .regex(
        /^[a-z_][a-z0-9_]*$/,
        'Username must start with a letter or underscore, and contain only letters, numbers, and underscores',
      )
      .optional(),
  })
  .refine((data) => data.display_name !== undefined || data.username !== undefined, {
    message: 'At least one field must be provided',
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
