import { prisma } from '../config/prisma.js';
import * as adminService from '../services/adminService.js';

export async function getStatus(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { isAdmin: true } });
  res.json(adminService.getStatus(user));
}

export async function unlock(req, res) {
  const user = await adminService.unlock(req.user.id, req.valid.body);
  res.json({ user });
}

export async function lock(req, res) {
  const user = await adminService.lock(req.user.id);
  res.json({ user });
}

export async function listTopics(req, res) {
  res.json(await adminService.listTopics(req.valid.query));
}

export async function createTopic(req, res) {
  const topic = await adminService.createTopic(req.user.id, req.valid.body);
  res.status(201).json({ topic });
}

export async function createTopicsBulk(req, res) {
  const topics = await adminService.createTopicsBulk(req.user.id, req.valid.body);
  res.status(201).json({ topics });
}

export async function updateTopic(req, res) {
  const topic = await adminService.updateTopic(req.valid.params.id, req.valid.body);
  res.json({ topic });
}

export async function deleteTopic(req, res) {
  await adminService.deleteTopic(req.valid.params.id);
  res.status(204).end();
}
