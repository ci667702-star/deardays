import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth } from '../middlewares/auth.js';
import { uploadProfileImage, verifyImageSignatures } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema } from '../validators/user.validators.js';

const router = Router();
router.use(requireAuth);

router.get('/me', userController.getMe);
router.put('/me', validate(updateProfileSchema), userController.updateMe);
router.post('/me/profile-image', uploadProfileImage, verifyImageSignatures, userController.uploadProfileImage);
router.delete('/me/profile-image', userController.deleteProfileImage);

export default router;
