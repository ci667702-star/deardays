import { Router } from 'express';
import * as pushController from '../controllers/pushController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { subscribeSchema, unsubscribeSchema } from '../validators/push.validators.js';

// 휴대폰·브라우저 푸시 알림
const router = Router();
router.use(requireAuth);

router.get('/', pushController.status);
router.post('/subscribe', validate(subscribeSchema), pushController.subscribe);
router.delete('/subscribe', validate(unsubscribeSchema), pushController.unsubscribe);
router.post('/test', pushController.test);

export default router;
