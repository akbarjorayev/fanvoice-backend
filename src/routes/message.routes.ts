import { Router } from 'express';
import { handleSendMessage, handleGetSentMessages, handleGetReceivedMessages, handleGetMessage, handleGetMessageCounts, handleMarkAsRead, handlePayMessage } from '../controllers/message.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { sendMessageSchema } from '../validators/message.validator';

const router = Router();

router.post('/', requireAuth, validate(sendMessageSchema), handleSendMessage);
router.get('/counts', requireAuth, handleGetMessageCounts);
router.get('/sent', requireAuth, handleGetSentMessages);
router.get('/received', requireAuth, handleGetReceivedMessages);
router.patch('/:id/read', requireAuth, handleMarkAsRead);
router.patch('/:id/pay', requireAuth, handlePayMessage);
router.get('/:id', requireAuth, handleGetMessage);

export default router;
