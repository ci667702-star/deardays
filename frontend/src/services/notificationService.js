import { api } from './api.js';

export const notificationService = {
  /** @returns {Promise<{ items, unreadCount }>} */
  async list() {
    const { data } = await api.get('/notifications');
    return data;
  },

  async unreadCount() {
    const { data } = await api.get('/notifications/unread-count');
    return data.unreadCount;
  },

  async markRead(id) {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead() {
    await api.post('/notifications/read-all');
  },
};
