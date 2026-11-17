import { api } from './api.js';

export const topicService = {
  /** 오늘의 주제 → { date, topic: { id, date, content } | null } */
  async today() {
    const { data } = await api.get('/topics/today');
    return data;
  },

  /** 공간의 주제 기록 (오늘까지 공개된 주제 + 이 공간에서 쓴 글) */
  async list({ roomId, page = 1, limit = 10 }) {
    const { data } = await api.get('/topics', { params: { roomId, page, limit } });
    return data; // { items: [{ id, date, content, entries }], page, total, hasMore }
  },

  async get(id) {
    const { data } = await api.get(`/topics/${id}`);
    return data.topic;
  },
};
