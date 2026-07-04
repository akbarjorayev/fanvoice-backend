import { Router } from 'express';
import {
  handleGoogleSignIn,
  handleEmailSignUp,
  handleEmailSignIn,
  handleChangePassword,
  handleGetMe,
  handleLogout,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  googleSignInSchema,
  emailSignUpSchema,
  emailSignInSchema,
  changePasswordSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/google', validate(googleSignInSchema), handleGoogleSignIn);
router.post('/signup', validate(emailSignUpSchema), handleEmailSignUp);
router.post('/login', validate(emailSignInSchema), handleEmailSignIn);
router.put('/password', requireAuth, validate(changePasswordSchema), handleChangePassword);
router.get('/me', requireAuth, handleGetMe);
router.post('/logout', requireAuth, handleLogout);

export default router;
