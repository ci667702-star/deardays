import { Router } from 'express';
import * as roomController from '../controllers/roomController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { roomIdParamSchema } from '../validators/common.js';
import { joinRoomSchema, roomNameSchema } from '../validators/room.validators.js';

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

export default router;
