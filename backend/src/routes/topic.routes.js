import { Router } from 'express';
import * as topicController from '../controllers/topicController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.js';
import { topicListQuerySchema } from '../validators/topic.validators.js';

const router = Router();
router.use(requireAuth);

router.get('/today', topicController.getToday);
router.get('/', validate(topicListQuerySchema, 'query'), topicController.listRoomTopics);
router.get('/:id', validate(idParamSchema, 'params'), topicController.getTopic);

export default router;
