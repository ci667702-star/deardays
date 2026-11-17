import * as notificationService from '../services/notificationService.js';

export async function listNotifications(req, res) {
  const result = await notificationService.listNotifications(req.user.id);
  res.json(result);
}

export async function unreadCount(req, res) {
  const unreadCount = await notificationService.getUnreadCount(req.user.id);
  res.json({ unreadCount });
}

export async function markRead(req, res) {
  await notificationService.markRead(req.user.id, req.valid.params.id);
  res.status(204).end();
}

export async function markAllRead(req, res) {
  await notificationService.markAllRead(req.user.id);
  res.status(204).end();
}
