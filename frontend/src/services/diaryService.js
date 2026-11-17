import { api } from './api.js';

function toFormData({ roomId, title, content, diaryDate, newImages = [], removeImageIds }) {
  const form = new FormData();
  if (roomId !== undefined) form.append('roomId', String(roomId));
  form.append('title', title);
  form.append('content', content);
  form.append('diaryDate', diaryDate);
  if (removeImageIds) form.append('removeImageIds', JSON.stringify(removeImageIds));
  newImages.forEach((file) => form.append('images', file));
  return form;
}

export const diaryService = {
  /** @returns {Promise<{items, page, limit, total, hasMore}>} */
  async list({ roomId, sort = 'latest', date, month, page = 1, limit = 10 }) {
    const { data } = await api.get('/diaries', { params: { roomId, sort, date, month, page, limit } });
    return data;
  },

  async calendar({ roomId, month }) {
    const { data } = await api.get('/diaries/calendar', { params: { roomId, month } });
    return data; // { month, days: [{ date, diaries: [{ id, title, authorId }] }] }
  },

  async get(id) {
    const { data } = await api.get(`/diaries/${id}`);
    return data.diary;
  },

  async create(payload, { onUploadProgress } = {}) {
    const { data } = await api.post('/diaries', toFormData(payload), { onUploadProgress });
    return data.diary;
  },

  async update(id, payload, { onUploadProgress } = {}) {
    const { data } = await api.put(`/diaries/${id}`, toFormData(payload), { onUploadProgress });
    return data.diary;
  },

  async remove(id) {
    await api.delete(`/diaries/${id}`);
  },

  async like(id) {
    const { data } = await api.post(`/diaries/${id}/likes`);
    return data; // { liked, likeCount }
  },

  async unlike(id) {
    const { data } = await api.delete(`/diaries/${id}/likes`);
    return data;
  },
};
