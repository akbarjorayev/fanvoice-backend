import { db } from '../config/database';
import { Message, ReadFilter, PayFilter, SortFilter } from '../types';
import { CREATOR_SHARE } from '../constants/fees';

export interface SentMessage extends Message {
  creator_name: string;
  creator_username: string;
  creator_avatar_url: string | null;
  paid_at: Date | null;
}

export interface ReceivedMessage extends Message {
  fan_name: string;
  fan_username: string;
  fan_avatar_url: string | null;
  creator_earning: number;
}

export interface MessageDetail {
  id: string;
  fan_id: string;
  creator_id: string;
  title: string;
  message: string;
  price: number;
  creator_earning: number;
  created_at: Date;
  read_at: Date | null;
  paid_at: Date | null;
  fan_name: string;
  fan_username: string;
  fan_avatar_url: string | null;
  fan_verified: boolean;
  creator_name: string;
  creator_username: string;
  creator_avatar_url: string | null;
  creator_verified: boolean;
}

function totalFromRows<T extends { total_count: string }>(rows: T[]): number {
  return rows.length > 0 ? Number(rows[0].total_count) : 0;
}

export async function createMessage(params: {
  fan_id: string;
  creator_id: string;
  title: string;
  message: string;
  price: number;
}): Promise<Message> {
  const result = await db.query<Message>(
    `INSERT INTO messages (fan_id, creator_id, title, message, price)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [params.fan_id, params.creator_id, params.title, params.message, params.price],
  );
  return result.rows[0];
}

export async function getSentMessages(
  fanId: string,
  page: number,
  limit: number,
  read: ReadFilter = 'all',
  pay: PayFilter = 'all',
): Promise<{ messages: SentMessage[]; total: number }> {
  type Row = SentMessage & { total_count: string };
  const conditions: string[] = ['m.fan_id = $1'];
  if (read === 'read') conditions.push('m.read_at IS NOT NULL');
  if (read === 'unread') conditions.push('m.read_at IS NULL');
  if (pay === 'paid') conditions.push('m.paid_at IS NOT NULL');
  if (pay === 'unpaid') conditions.push('m.paid_at IS NULL');
  const result = await db.query<Row>(
    `SELECT m.id, m.fan_id, m.creator_id, m.title, m.message, m.price, m.created_at, m.read_at, m.paid_at,
            u.display_name AS creator_name, u.username AS creator_username, u.avatar_url AS creator_avatar_url,
            COUNT(*) OVER() AS total_count
     FROM messages m
     JOIN users u ON m.creator_id = u.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY m.created_at DESC
     LIMIT $2 OFFSET $3`,
    [fanId, limit, (page - 1) * limit],
  );
  return { messages: result.rows, total: totalFromRows(result.rows) };
}

export async function getReceivedMessages(
  creatorId: string,
  page: number,
  limit: number,
  sort: SortFilter = 'date',
  read: ReadFilter = 'all',
): Promise<{ messages: ReceivedMessage[]; total: number }> {
  type Row = ReceivedMessage & { total_count: string };
  const orderBy = sort === 'money' ? 'm.price DESC' : 'm.created_at DESC';
  const conditions: string[] = ['m.creator_id = $1', 'm.paid_at IS NOT NULL'];
  if (read === 'read') conditions.push('m.read_at IS NOT NULL');
  if (read === 'unread') conditions.push('m.read_at IS NULL');
  const result = await db.query<Row>(
    `SELECT m.id, m.fan_id, m.creator_id, m.title, m.message, m.price, m.created_at, m.read_at,
            ROUND(m.price * ${CREATOR_SHARE})::int AS creator_earning,
            u.display_name AS fan_name, u.username AS fan_username, u.avatar_url AS fan_avatar_url,
            COUNT(*) OVER() AS total_count
     FROM messages m
     JOIN users u ON m.fan_id = u.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY ${orderBy}
     LIMIT $2 OFFSET $3`,
    [creatorId, limit, (page - 1) * limit],
  );
  return { messages: result.rows, total: totalFromRows(result.rows) };
}

export async function getMessageCounts(userId: string): Promise<{ sent: number; received: number; unread_received: number; total_earned: number }> {
  const result = await db.query<{ sent_count: string; received_count: string; unread_received_count: string; total_earned: string }>(
    `SELECT
       (SELECT COUNT(*) FROM messages WHERE fan_id = $1) AS sent_count,
       (SELECT COUNT(*) FROM messages WHERE creator_id = $1 AND paid_at IS NOT NULL) AS received_count,
       (SELECT COUNT(*) FROM messages WHERE creator_id = $1 AND paid_at IS NOT NULL AND read_at IS NULL) AS unread_received_count,
       COALESCE((SELECT SUM(ROUND(price * ${CREATOR_SHARE})) FROM messages WHERE creator_id = $1 AND paid_at IS NOT NULL AND read_at IS NOT NULL), 0) AS total_earned`,
    [userId],
  );
  return {
    sent: Number(result.rows[0].sent_count),
    received: Number(result.rows[0].received_count),
    unread_received: Number(result.rows[0].unread_received_count),
    total_earned: Number(result.rows[0].total_earned),
  };
}

export async function markMessageAsRead(id: string): Promise<void> {
  await db.query(
    `UPDATE messages SET read_at = NOW() WHERE id = $1 AND read_at IS NULL`,
    [id],
  );
}

export async function markMessageAsPaid(id: string): Promise<void> {
  await db.query(
    `UPDATE messages SET paid_at = NOW() WHERE id = $1 AND paid_at IS NULL`,
    [id],
  );
}

export async function updateMessagePrice(id: string, price: number): Promise<void> {
  await db.query(
    `UPDATE messages SET price = $2 WHERE id = $1 AND paid_at IS NULL`,
    [id, price],
  );
}

export async function deleteMessage(id: string): Promise<void> {
  await db.query(
    `DELETE FROM messages WHERE id = $1 AND paid_at IS NULL`,
    [id],
  );
}

export async function getMessageById(id: string): Promise<MessageDetail | null> {
  const result = await db.query<MessageDetail>(
    `SELECT m.id, m.fan_id, m.creator_id, m.title, m.message, m.price, m.created_at, m.read_at, m.paid_at,
            ROUND(m.price * ${CREATOR_SHARE})::int AS creator_earning,
            f.display_name AS fan_name, f.username AS fan_username, f.avatar_url AS fan_avatar_url,
            (cf.verified_at IS NOT NULL) AS fan_verified,
            c.display_name AS creator_name, c.username AS creator_username, c.avatar_url AS creator_avatar_url,
            (cc.verified_at IS NOT NULL) AS creator_verified
     FROM messages m
     JOIN users f ON m.fan_id = f.id
     LEFT JOIN creators cf ON cf.user_id = f.id
     JOIN users c ON m.creator_id = c.id
     LEFT JOIN creators cc ON cc.user_id = c.id
     WHERE m.id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}
