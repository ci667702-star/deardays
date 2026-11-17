import * as topicService from '../services/topicService.js';

export async function getToday(_req, res) {
  res.json(await topicService.getTodayTopic());
}

export async function listRoomTopics(req, res) {
  res.json(await topicService.listRoomTopics(req.user.id, req.valid.query));
}

export async function getTopic(req, res) {
  const topic = await topicService.getTopic(req.user.id, req.valid.params.id);
  res.json({ topic });
}
