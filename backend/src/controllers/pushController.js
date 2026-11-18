import * as pushService from '../services/pushService.js';

export async function status(req, res) {
  res.json({ ...pushService.getStatus(), devices: await pushService.countMine(req.user.id) });
}

export async function subscribe(req, res) {
  res.status(201).json(await pushService.subscribe(req.user.id, req.valid.body, req.get('user-agent')));
}

export async function unsubscribe(req, res) {
  res.json(await pushService.unsubscribe(req.user.id, req.valid.body));
}

export async function test(req, res) {
  res.json(await pushService.sendTest(req.user.id));
}
