import { getMessageById, MessageDetail } from '../repositories/message.repository';
import { httpError } from '../middleware/error.middleware';
import { ERROR_CODES } from '../constants/error-codes';

export async function getMessageOrThrow(id: string): Promise<MessageDetail> {
  const msg = await getMessageById(id);
  if (!msg) throw httpError(ERROR_CODES.MESSAGE_NOT_FOUND, 404);
  return msg;
}
