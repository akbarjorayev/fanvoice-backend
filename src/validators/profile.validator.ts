import { z } from 'zod';
import { ERROR_CODES } from '../constants/error-codes';

export const updateProfileSchema = z
  .object({
    display_name: z
      .string()
      .min(2, ERROR_CODES.VALIDATION_DISPLAY_NAME_MIN)
      .max(30, ERROR_CODES.VALIDATION_DISPLAY_NAME_MAX)
      .optional(),
    username: z
      .string()
      .min(2, ERROR_CODES.VALIDATION_USERNAME_MIN)
      .max(20, ERROR_CODES.VALIDATION_USERNAME_MAX)
      .toLowerCase()
      .regex(/^[a-z_][a-z0-9_]*$/, ERROR_CODES.VALIDATION_USERNAME_FORMAT)
      .optional(),
  })
  .refine((data) => data.display_name !== undefined || data.username !== undefined, {
    message: ERROR_CODES.VALIDATION_PROFILE_AT_LEAST_ONE_FIELD,
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
