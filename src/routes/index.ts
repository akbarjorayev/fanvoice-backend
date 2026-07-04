import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import publicRoutes from './public.routes';
import messageRoutes from './message.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/u', publicRoutes);
router.use('/messages', messageRoutes);

export default router;
