import { Router } from 'express';
import * as commentController from '../controllers/commentController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.js';
import { commentSchema } from '../validators/diary.validators.js';

const router = Router();
router.use(requireAuth);

router.put('/:id', validate(idParamSchema, 'params'), validate(commentSchema), commentController.updateComment);
router.delete('/:id', validate(idParamSchema, 'params'), commentController.deleteComment);

export default router;
