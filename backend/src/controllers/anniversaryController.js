import * as anniversaryService from '../services/anniversaryService.js';

export async function list(req, res) {
  const items = await anniversaryService.listAnniversaries(req.user.id, req.valid.params.roomId);
  res.json({ items });
}

export async function create(req, res) {
  const anniversary = await anniversaryService.createAnniversary(req.user.id, req.valid.params.roomId, req.valid.body);
  res.status(201).json({ anniversary });
}

export async function update(req, res) {
  const anniversary = await anniversaryService.updateAnniversary(req.user.id, req.valid.params.id, req.valid.body);
  res.json({ anniversary });
}

export async function remove(req, res) {
  await anniversaryService.deleteAnniversary(req.user.id, req.valid.params.id);
  res.status(204).end();
}
