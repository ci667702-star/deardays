import { Router } from 'express';
import * as diaryController from '../controllers/diaryController.js';
import { requireAuth } from '../middlewares/auth.js';
import { optimizeImages, uploadDiaryImages, verifyImageSignatures } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.js';
import {
  calendarQuerySchema,
  commentSchema,
  createDiarySchema,
  listDiaryQuerySchema,
  updateDiarySchema,
} from '../validators/diary.validators.js';

const router = Router();
router.use(requireAuth);

const byId = validate(idParamSchema, 'params');

router.post('/', uploadDiaryImages, verifyImageSignatures, optimizeImages('diary'), validate(createDiarySchema), diaryController.createDiary);
router.get('/', validate(listDiaryQuerySchema, 'query'), diaryController.listDiaries);
// /:id 보다 먼저 선언해야 'calendar'가 id로 해석되지 않는다.
router.get('/calendar', validate(calendarQuerySchema, 'query'), diaryController.getCalendar);
router.get('/:id', byId, diaryController.getDiary);
router.put(
  '/:id',
  byId,
  uploadDiaryImages,
  verifyImageSignatures,
  optimizeImages('diary'),
  validate(updateDiarySchema),
  diaryController.updateDiary,
);
router.delete('/:id', byId, diaryController.deleteDiary);

router.get('/:id/comments', byId, diaryController.listComments);
router.post('/:id/comments', byId, validate(commentSchema), diaryController.createComment);

router.post('/:id/likes', byId, diaryController.likeDiary);
router.delete('/:id/likes', byId, diaryController.unlikeDiary);

export default router;
