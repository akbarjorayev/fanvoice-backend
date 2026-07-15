import { getMessageById, MessageDetail } from '../repositories/message.repository';
import { httpError } from '../middleware/error.middleware';

export async function getMessageOrThrow(id: string): Promise<MessageDetail> {
  const msg = await getMessageById(id);
  if (!msg) throw httpError('Message not found', 404);
  return msg;
}
