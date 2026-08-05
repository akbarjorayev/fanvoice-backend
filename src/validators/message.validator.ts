import { z } from 'zod';
import { ERROR_CODES } from '../constants/error-codes';

export const sendMessageSchema = z.object({
  creator_id: z.string().uuid(ERROR_CODES.VALIDATION_CREATOR_ID_INVALID),
  title: z.string().min(1, ERROR_CODES.VALIDATION_TITLE_REQUIRED).max(100, ERROR_CODES.VALIDATION_TITLE_MAX),
  message: z.string().min(1, ERROR_CODES.VALIDATION_MESSAGE_REQUIRED).max(1000, ERROR_CODES.VALIDATION_MESSAGE_MAX),
  price: z.number().int(ERROR_CODES.VALIDATION_PRICE_INTEGER).min(0, ERROR_CODES.VALIDATION_PRICE_MIN),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const editMessagePriceSchema = z.object({
  price: z.number().int(ERROR_CODES.VALIDATION_PRICE_INTEGER).min(0, ERROR_CODES.VALIDATION_PRICE_MIN),
});

export type EditMessagePriceInput = z.infer<typeof editMessagePriceSchema>;
