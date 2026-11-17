import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.js';

const router = Router();
router.use(requireAuth);

router.get('/', notificationController.listNotifications);
// 작업 표시줄이 주기적으로 부르는 가벼운 API
router.get('/unread-count', notificationController.unreadCount);
router.post('/read-all', notificationController.markAllRead);
router.patch('/:id/read', validate(idParamSchema, 'params'), notificationController.markRead);

export default router;
