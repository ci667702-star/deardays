import * as commentService from '../services/commentService.js';

export async function updateComment(req, res) {
  const comment = await commentService.updateComment(req.user.id, req.valid.params.id, req.valid.body);
  res.json({ comment });
}

export async function deleteComment(req, res) {
  await commentService.deleteComment(req.user.id, req.valid.params.id);
  res.status(204).end();
}
