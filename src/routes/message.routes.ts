import { Router } from 'express';
import { handleSendMessage, handleGetSentMessages, handleGetReceivedMessages, handleGetMessage, handleGetMessageCounts, handleMarkAsRead, handlePayMessage, handleEditMessagePrice, handleDeleteMessage } from '../controllers/message.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { sendMessageSchema, editMessagePriceSchema } from '../validators/message.validator';

const router = Router();

router.post('/', requireAuth, validate(sendMessageSchema), handleSendMessage);
router.get('/counts', requireAuth, handleGetMessageCounts);
router.get('/sent', requireAuth, handleGetSentMessages);
router.get('/received', requireAuth, handleGetReceivedMessages);
router.patch('/:id/read', requireAuth, handleMarkAsRead);
router.patch('/:id/pay', requireAuth, handlePayMessage);
router.patch('/:id/price', requireAuth, validate(editMessagePriceSchema), handleEditMessagePrice);
router.delete('/:id', requireAuth, handleDeleteMessage);
router.get('/:id', requireAuth, handleGetMessage);

export default router;
