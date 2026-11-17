import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth } from '../middlewares/auth.js';
import { loginLimiter } from '../middlewares/rateLimit.js';
import { optimizeImages, uploadProfileImage, verifyImageSignatures } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { changePasswordSchema, deleteAccountSchema, updateProfileSchema } from '../validators/user.validators.js';

const router = Router();
router.use(requireAuth);

router.get('/me', userController.getMe);
router.put('/me', validate(updateProfileSchema), userController.updateMe);
router.post('/me/profile-image', uploadProfileImage, verifyImageSignatures, optimizeImages('profile'), userController.uploadProfileImage);
router.delete('/me/profile-image', userController.deleteProfileImage);
// 비밀번호를 확인하는 요청은 로그인처럼 틀린 시도 횟수를 제한한다
router.put('/me/password', loginLimiter, validate(changePasswordSchema), userController.changePassword);
router.delete('/me', loginLimiter, validate(deleteAccountSchema), userController.deleteAccount);

export default router;
