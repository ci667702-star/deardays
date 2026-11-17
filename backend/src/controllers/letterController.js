import * as letterService from '../services/letterService.js';

export async function listLetters(req, res) {
  const result = await letterService.listLetters(req.user.id, req.valid.query);
  res.json(result);
}

export async function createLetter(req, res) {
  const letter = await letterService.createLetter(req.user.id, req.valid.body);
  res.status(201).json({ letter });
}

export async function getLetter(req, res) {
  const letter = await letterService.getLetter(req.user.id, req.valid.params.id);
  res.json({ letter });
}

export async function deleteLetter(req, res) {
  await letterService.deleteLetter(req.user.id, req.valid.params.id);
  res.status(204).end();
}
