import { z } from 'zod';

export const sendMessageSchema = z.object({
  creator_id: z.string().uuid('Invalid creator ID'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be at most 1000 characters'),
  price: z.number().int('Price must be a whole number').min(0, 'Price must be at least 0'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
