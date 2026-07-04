import { z } from 'zod';

export const googleSignInSchema = z.object({
  code: z.string().min(1, 'code is required'),
});

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const emailSignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
});

export const emailSignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type GoogleSignInInput = z.infer<typeof googleSignInSchema>;
export type EmailSignUpInput = z.infer<typeof emailSignUpSchema>;
export type EmailSignInInput = z.infer<typeof emailSignInSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
