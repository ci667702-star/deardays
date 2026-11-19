import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import * as inquiryController from '../controllers/inquiryController.js';
import { requireAdmin } from '../middlewares/admin.js';
import { requireAuth } from '../middlewares/auth.js';
import { loginLimiter } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.js';
import {
  adminTopicQuerySchema,
  adminUnlockSchema,
  bulkTopicSchema,
  createTopicSchema,
  updateTopicSchema,
} from '../validators/topic.validators.js';
import { adminInquiryQuerySchema, updateInquirySchema } from '../validators/inquiry.validators.js';

const router = Router();
router.use(requireAuth);

router.get('/status', adminController.getStatus);
// 관리자 비밀번호는 로그인처럼 틀린 시도 횟수를 제한한다
router.post('/unlock', loginLimiter, validate(adminUnlockSchema), adminController.unlock);
router.post('/lock', adminController.lock);

// 아래는 관리자만: 오늘의 주제 관리
router.use('/topics', requireAdmin);
router.get('/topics', validate(adminTopicQuerySchema, 'query'), adminController.listTopics);
router.post('/topics', validate(createTopicSchema), adminController.createTopic);
router.post('/topics/bulk', validate(bulkTopicSchema), adminController.createTopicsBulk);
router.put('/topics/:id', validate(idParamSchema, 'params'), validate(updateTopicSchema), adminController.updateTopic);
router.delete('/topics/:id', validate(idParamSchema, 'params'), adminController.deleteTopic);

// 관리자만: 문의함
router.use('/inquiries', requireAdmin);
router.get('/inquiries', validate(adminInquiryQuerySchema, 'query'), inquiryController.listForAdmin);
router.put('/inquiries/:id', validate(idParamSchema, 'params'), validate(updateInquirySchema), inquiryController.updateForAdmin);
router.delete('/inquiries/:id', validate(idParamSchema, 'params'), inquiryController.removeForAdmin);

export default router;
