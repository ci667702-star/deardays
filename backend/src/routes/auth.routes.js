import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middlewares/auth.js';
import { emailCheckLimiter, loginLimiter, registerLimiter } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';
import { emailQuerySchema, loginSchema, registerSchema } from '../validators/auth.validators.js';

const router = Router();

router.post('/register', registerLimiter, validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.get('/me', requireAuth, authController.me);
// 회원가입 화면의 이메일 중복 확인
router.get('/check-email', emailCheckLimiter, validate(emailQuerySchema, 'query'), authController.checkEmail);

export default router;
