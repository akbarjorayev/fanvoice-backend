import { z } from 'zod';
import { ERROR_CODES } from '../constants/error-codes';

export const googleSignInSchema = z.object({
  code: z.string().min(1, ERROR_CODES.VALIDATION_CODE_REQUIRED),
});

const passwordSchema = z
  .string()
  .min(8, ERROR_CODES.VALIDATION_PASSWORD_MIN)
  .regex(/[A-Z]/, ERROR_CODES.VALIDATION_PASSWORD_UPPERCASE)
  .regex(/[0-9]/, ERROR_CODES.VALIDATION_PASSWORD_NUMBER);

export const emailSignUpSchema = z.object({
  email: z.string().email(ERROR_CODES.VALIDATION_EMAIL_INVALID),
  password: passwordSchema,
});

export const emailSignInSchema = z.object({
  email: z.string().email(ERROR_CODES.VALIDATION_EMAIL_INVALID),
  password: z.string().min(1, ERROR_CODES.VALIDATION_PASSWORD_REQUIRED),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, ERROR_CODES.VALIDATION_CURRENT_PASSWORD_REQUIRED),
  newPassword: passwordSchema,
});

export type GoogleSignInInput = z.infer<typeof googleSignInSchema>;
export type EmailSignUpInput = z.infer<typeof emailSignUpSchema>;
export type EmailSignInInput = z.infer<typeof emailSignInSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
