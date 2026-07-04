import { Router } from 'express';
import { handleGetPublicProfile } from '../controllers/public.controller';

const router = Router();

router.get('/:username', handleGetPublicProfile);

export default router;
