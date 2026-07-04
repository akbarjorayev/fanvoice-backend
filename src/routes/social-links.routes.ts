import { Router } from 'express';
import {
  handleGetSocialLinks,
  handleUpsertSocialLink,
  handleDeleteSocialLink,
} from '../controllers/social-links.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upsertSocialLinkSchema } from '../validators/social-links.validator';

const router = Router();

router.get('/', requireAuth, handleGetSocialLinks);
router.put('/:platform', requireAuth, validate(upsertSocialLinkSchema), handleUpsertSocialLink);
router.delete('/:platform', requireAuth, handleDeleteSocialLink);

export default router;
