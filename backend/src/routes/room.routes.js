import { Router } from 'express';
import * as roomController from '../controllers/roomController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { roomIdParamSchema } from '../validators/common.js';
import { anniversarySchema, joinRoomSchema, recapQuerySchema, roomNameSchema } from '../validators/room.validators.js';
import * as anniversaryController from '../controllers/anniversaryController.js';

const router = Router();
router.use(requireAuth);

router.post('/', validate(roomNameSchema), roomController.createRoom);
router.post('/join', validate(joinRoomSchema), roomController.joinRoom);
router.get('/', roomController.listRooms);
router.get('/:roomId', validate(roomIdParamSchema, 'params'), roomController.getRoom);
router.patch(
  '/:roomId',
  validate(roomIdParamSchema, 'params'),
  validate(roomNameSchema),
  roomController.renameRoom,
);
router.post(
  '/:roomId/invite-code',
  validate(roomIdParamSchema, 'params'),
  roomController.regenerateInviteCode,
);
router.delete('/:roomId/members/me', validate(roomIdParamSchema, 'params'), roomController.leaveRoom);
// 연말 결산: 그해 공간의 기록 모아 보기
router.get('/:roomId/recap', validate(roomIdParamSchema, 'params'), validate(recapQuerySchema, 'query'), roomController.getRecap);
// 기념일 (D-day)
router.get('/:roomId/anniversaries', validate(roomIdParamSchema, 'params'), anniversaryController.list);
router.post('/:roomId/anniversaries', validate(roomIdParamSchema, 'params'), validate(anniversarySchema), anniversaryController.create);

export default router;
