import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ReadFilter, PayFilter, SortFilter } from '../types';
import { createMessage, getSentMessages, getReceivedMessages, getMessageCounts, markMessageAsRead, markMessageAsPaid, updateMessagePrice, deleteMessage } from '../repositories/message.repository';
import { getCreatorByUserId } from '../repositories/creator.repository';
import { requireCreator } from '../services/creator.service';
import { getMessageOrThrow } from '../services/message.service';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '../constants/pagination';
import { PLATFORM_MIN_PRICE } from '../constants/pricing';
import { ERROR_CODES } from '../constants/error-codes';

function parsePage(raw: unknown): number {
  const n = parseInt(String(raw ?? '1'), 10);
  return isNaN(n) || n < 1 ? 1 : n;
}

function parseLimit(raw: unknown): number {
  const n = parseInt(String(raw ?? DEFAULT_PAGE_LIMIT), 10);
  if (isNaN(n) || n < 1) return DEFAULT_PAGE_LIMIT;
  return Math.min(n, MAX_PAGE_LIMIT);
}

export async function handleSendMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { creator_id, title, message, price } = req.body;
    const fanId = req.user!.id;

    if (fanId === creator_id) {
      res.status(400).json({ code: ERROR_CODES.MESSAGE_SELF_SEND });
      return;
    }

    const creator = await getCreatorByUserId(creator_id);
    if (!creator) {
      res.status(404).json({ code: ERROR_CODES.CREATOR_NOT_FOUND });
      return;
    }

    const effectiveMin = Math.max(PLATFORM_MIN_PRICE, creator.min_price_per_message);
    if (price < effectiveMin) {
      res.status(400).json({ code: ERROR_CODES.MESSAGE_PRICE_TOO_LOW, params: { min: effectiveMin } });
      return;
    }

    const msg = await createMessage({ fan_id: fanId, creator_id, title, message, price });
    res.status(201).json({ message: msg });
  } catch (err) {
    next(err);
  }
}

export async function handleGetSentMessages(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const read: ReadFilter = req.query.read === 'read' ? 'read' : req.query.read === 'unread' ? 'unread' : 'all';
    const pay: PayFilter = req.query.pay === 'paid' ? 'paid' : req.query.pay === 'unpaid' ? 'unpaid' : 'all';
    const { messages, total } = await getSentMessages(req.user!.id, page, limit, read, pay);
    res.status(200).json({ messages, total, page, limit });
  } catch (err) {
    next(err);
  }
}

export async function handleGetReceivedMessages(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await requireCreator(req.user!.id);
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const sort: SortFilter = req.query.sort === 'money' ? 'money' : 'date';
    const read: ReadFilter = req.query.read === 'read' ? 'read' : req.query.read === 'unread' ? 'unread' : 'all';
    const { messages, total } = await getReceivedMessages(req.user!.id, page, limit, sort, read);
    res.status(200).json({ messages, total, page, limit });
  } catch (err) {
    next(err);
  }
}

export async function handleGetMessageCounts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const counts = await getMessageCounts(req.user!.id);
    res.status(200).json(counts);
  } catch (err) {
    next(err);
  }
}

export async function handleMarkAsRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const msg = await getMessageOrThrow(String(req.params.id));
    if (msg.creator_id !== req.user!.id) {
      res.status(403).json({ code: ERROR_CODES.MESSAGE_MARK_READ_FORBIDDEN });
      return;
    }
    await markMessageAsRead(String(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function handlePayMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const msg = await getMessageOrThrow(String(req.params.id));
    if (msg.fan_id !== req.user!.id) {
      res.status(403).json({ code: ERROR_CODES.MESSAGE_PAY_FORBIDDEN });
      return;
    }
    if (msg.paid_at) {
      res.status(400).json({ code: ERROR_CODES.MESSAGE_ALREADY_PAID });
      return;
    }
    await markMessageAsPaid(String(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function handleEditMessagePrice(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const msg = await getMessageOrThrow(String(req.params.id));
    if (msg.fan_id !== req.user!.id) {
      res.status(403).json({ code: ERROR_CODES.MESSAGE_EDIT_PRICE_FORBIDDEN });
      return;
    }
    if (msg.paid_at) {
      res.status(400).json({ code: ERROR_CODES.MESSAGE_ALREADY_PAID });
      return;
    }

    const { price } = req.body;
    const creator = await getCreatorByUserId(msg.creator_id);
    if (!creator) {
      res.status(404).json({ code: ERROR_CODES.CREATOR_NOT_FOUND });
      return;
    }

    const effectiveMin = Math.max(PLATFORM_MIN_PRICE, creator.min_price_per_message);
    if (price < effectiveMin) {
      res.status(400).json({ code: ERROR_CODES.MESSAGE_PRICE_TOO_LOW, params: { min: effectiveMin } });
      return;
    }

    await updateMessagePrice(String(req.params.id), price);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const msg = await getMessageOrThrow(String(req.params.id));
    if (msg.fan_id !== req.user!.id) {
      res.status(403).json({ code: ERROR_CODES.MESSAGE_DELETE_FORBIDDEN });
      return;
    }
    if (msg.paid_at) {
      res.status(400).json({ code: ERROR_CODES.MESSAGE_ALREADY_PAID });
      return;
    }
    await deleteMessage(String(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function handleGetMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const msg = await getMessageOrThrow(String(req.params.id));
    const userId = req.user!.id;
    if (msg.fan_id !== userId && msg.creator_id !== userId) {
      res.status(403).json({ code: ERROR_CODES.MESSAGE_ACCESS_DENIED });
      return;
    }
    res.status(200).json({ message: msg });
  } catch (err) {
    next(err);
  }
}
