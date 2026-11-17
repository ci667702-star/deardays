import * as diaryService from '../services/diaryService.js';
import * as commentService from '../services/commentService.js';
import * as likeService from '../services/likeService.js';

export async function createDiary(req, res) {
  const diary = await diaryService.createDiary(req.user.id, req.valid.body, req.files ?? []);
  res.status(201).json({ diary });
}

export async function listDiaries(req, res) {
  const result = await diaryService.listDiaries(req.user.id, req.valid.query);
  res.json(result);
}

export async function getCalendar(req, res) {
  const result = await diaryService.getCalendar(req.user.id, req.valid.query);
  res.json(result);
}

export async function getDiary(req, res) {
  const diary = await diaryService.getDiary(req.user.id, req.valid.params.id);
  res.json({ diary });
}

export async function updateDiary(req, res) {
  const diary = await diaryService.updateDiary(req.user.id, req.valid.params.id, req.valid.body, req.files ?? []);
  res.json({ diary });
}

export async function deleteDiary(req, res) {
  await diaryService.deleteDiary(req.user.id, req.valid.params.id);
  res.status(204).end();
}

export async function listComments(req, res) {
  const comments = await commentService.listComments(req.user.id, req.valid.params.id);
  res.json({ comments });
}

export async function createComment(req, res) {
  const comment = await commentService.createComment(req.user.id, req.valid.params.id, req.valid.body);
  res.status(201).json({ comment });
}

export async function likeDiary(req, res) {
  const result = await likeService.likeDiary(req.user.id, req.valid.params.id);
  res.json(result);
}

export async function unlikeDiary(req, res) {
  const result = await likeService.unlikeDiary(req.user.id, req.valid.params.id);
  res.json(result);
}
