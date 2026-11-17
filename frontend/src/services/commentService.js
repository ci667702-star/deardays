import { api } from './api.js';

export const commentService = {
  async list(diaryId) {
    const { data } = await api.get(`/diaries/${diaryId}/comments`);
    return data.comments;
  },

  async create(diaryId, content) {
    const { data } = await api.post(`/diaries/${diaryId}/comments`, { content });
    return data.comment;
  },

  async update(commentId, content) {
    const { data } = await api.put(`/comments/${commentId}`, { content });
    return data.comment;
  },

  async remove(commentId) {
    await api.delete(`/comments/${commentId}`);
  },
};
