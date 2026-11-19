import { api } from './api.js';

/** 관리자: 관리자 비밀번호로 켜고, 오늘의 주제를 넣고 고치고, 문의함을 본다 */
export const adminService = {
  async status() {
    const { data } = await api.get('/admin/status');
    return data; // { enabled, isAdmin }
  },

  async unlock(password) {
    const { data } = await api.post('/admin/unlock', { password });
    return data.user;
  },

  async lock() {
    const { data } = await api.post('/admin/lock');
    return data.user;
  },

  async listTopics({ scope = 'upcoming', page = 1, limit = 50 } = {}) {
    const { data } = await api.get('/admin/topics', { params: { scope, page, limit } });
    return data; // { items, total, hasMore, today, nextEmptyDate }
  },

  async createTopic({ content, date }) {
    const { data } = await api.post('/admin/topics', { content, date: date || undefined });
    return data.topic;
  },

  async createTopics(contents) {
    const { data } = await api.post('/admin/topics/bulk', { contents });
    return data.topics;
  },

  async updateTopic(id, { content, date }) {
    const { data } = await api.put(`/admin/topics/${id}`, { content, date });
    return data.topic;
  },

  async deleteTopic(id) {
    await api.delete(`/admin/topics/${id}`);
  },

  async listInquiries({ status = 'open', page = 1, limit = 30 } = {}) {
    const { data } = await api.get('/admin/inquiries', { params: { status, page, limit } });
    return data; // { items, total, hasMore, counts: { open, done } }
  },

  /** answer 를 빼면 답변은 그대로, '' 이면 답변을 지운다. status: 'open' | 'done' */
  async updateInquiry(id, { answer, status }) {
    const { data } = await api.put(`/admin/inquiries/${id}`, { answer, status });
    return data.inquiry;
  },

  async deleteInquiry(id) {
    await api.delete(`/admin/inquiries/${id}`);
  },
};
