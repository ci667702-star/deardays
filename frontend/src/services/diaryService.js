import { api } from './api.js';

function toFormData({ roomId, title, content, diaryDate, mood, weather, topicId, newImages = [], removeImageIds, doodle, removeDoodle }) {
  const form = new FormData();
  if (roomId !== undefined) form.append('roomId', String(roomId));
  form.append('title', title);
  form.append('content', content);
  form.append('diaryDate', diaryDate);
  // 비워 보내면 서버가 '없음'으로 저장
  form.append('mood', mood ?? '');
  form.append('weather', weather ?? '');
  form.append('topicId', topicId ? String(topicId) : '');
  if (removeImageIds) form.append('removeImageIds', JSON.stringify(removeImageIds));
  newImages.forEach((file) => form.append('images', file));
  // 낙서: 새로 그린 PNG(Blob)를 보내면 바뀌고, removeDoodle 이면 빠진다
  if (doodle) form.append('doodle', doodle, 'doodle.png');
  else if (removeDoodle) form.append('removeDoodle', 'true');
  return form;
}

export const diaryService = {
  /** @returns {Promise<{items, page, limit, total, hasMore}>} */
  async list({ roomId, sort = 'latest', date, month, page = 1, limit = 10, q, authorId, topicId, from, to }) {
    const { data } = await api.get('/diaries', {
      params: {
        roomId,
        sort,
        date,
        month,
        page,
        limit,
        q: q || undefined,
        authorId: authorId || undefined,
        topicId: topicId || undefined,
        from: from || undefined,
        to: to || undefined,
      },
    });
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

  /** 도장 찍기 / 떼기 → { diaryId, stamps } */
  async stamp(id, kind) {
    const { data } = await api.post(`/diaries/${id}/stamps`, { kind });
    return data;
  },

  async unstamp(id, kind) {
    const { data } = await api.delete(`/diaries/${id}/stamps/${kind}`);
    return data;
  },
};
