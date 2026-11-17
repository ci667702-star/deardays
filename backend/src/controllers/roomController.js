import * as roomService from '../services/roomService.js';
import * as recapService from '../services/recapService.js';

export async function createRoom(req, res) {
  const room = await roomService.createRoom(req.user.id, req.valid.body);
  res.status(201).json({ room });
}

export async function joinRoom(req, res) {
  const room = await roomService.joinRoom(req.user.id, req.valid.body);
  res.status(201).json({ room });
}

export async function listRooms(req, res) {
  const rooms = await roomService.listRooms(req.user.id);
  res.json({ rooms });
}

export async function getRoom(req, res) {
  const room = await roomService.getRoom(req.valid.params.roomId, req.user.id);
  res.json({ room });
}

export async function renameRoom(req, res) {
  const room = await roomService.renameRoom(req.valid.params.roomId, req.user.id, req.valid.body);
  res.json({ room });
}

export async function regenerateInviteCode(req, res) {
  const room = await roomService.regenerateInviteCode(req.valid.params.roomId, req.user.id);
  res.json({ room });
}

export async function leaveRoom(req, res) {
  const result = await roomService.leaveRoom(req.valid.params.roomId, req.user.id);
  res.json(result);
}

export async function getRecap(req, res) {
  const recap = await recapService.getRecap(req.user.id, req.valid.params.roomId, req.valid.query);
  res.json({ recap });
}
