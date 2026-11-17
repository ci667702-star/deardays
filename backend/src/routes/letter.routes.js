import { Router } from 'express';
import * as letterController from '../controllers/letterController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.js';
import { createLetterSchema, listLetterQuerySchema } from '../validators/letter.validators.js';

const router = Router();
router.use(requireAuth);

const byId = validate(idParamSchema, 'params');

router.get('/', validate(listLetterQuerySchema, 'query'), letterController.listLetters);
router.post('/', validate(createLetterSchema), letterController.createLetter);
// 받는 사람은 여는 날이 되어야 내용을 볼 수 있다 (처음 열면 보낸 사람에게 알림)
router.get('/:id', byId, letterController.getLetter);
router.delete('/:id', byId, letterController.deleteLetter);

export default router;
