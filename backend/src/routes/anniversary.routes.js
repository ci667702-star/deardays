import { Router } from 'express';
import * as anniversaryController from '../controllers/anniversaryController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.js';
import { anniversarySchema } from '../validators/room.validators.js';

// 기념일 하나 고치기·지우기 (목록·추가는 /api/rooms/:roomId/anniversaries)
const router = Router();
router.use(requireAuth);

router.put('/:id', validate(idParamSchema, 'params'), validate(anniversarySchema), anniversaryController.update);
router.delete('/:id', validate(idParamSchema, 'params'), anniversaryController.remove);

export default router;
