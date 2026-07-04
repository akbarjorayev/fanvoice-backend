import { Router } from 'express';
import { handleGetProfile, handleUpdateProfile } from '../controllers/profile.controller';
import { handleBecomeCreator, handleUpdateCreator } from '../controllers/creator.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema } from '../validators/profile.validator';
import socialLinksRoutes from './social-links.routes';

const router = Router();

router.get('/', requireAuth, handleGetProfile);
router.patch('/', requireAuth, validate(updateProfileSchema), handleUpdateProfile);
router.post('/creator', requireAuth, handleBecomeCreator);
router.patch('/creator', requireAuth, handleUpdateCreator);
router.use('/social-links', socialLinksRoutes);

export default router;
