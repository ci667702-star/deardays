import { Router } from 'express';
import * as inquiryController from '../controllers/inquiryController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.js';
import { createInquirySchema } from '../validators/inquiry.validators.js';

// 내 문의: 보내기·목록·지우기 (관리자 문의함은 /api/admin/inquiries)
const router = Router();
router.use(requireAuth);

router.get('/', inquiryController.listMine);
router.post('/', validate(createInquirySchema), inquiryController.create);
router.delete('/:id', validate(idParamSchema, 'params'), inquiryController.removeMine);

export default router;
