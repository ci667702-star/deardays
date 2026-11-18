import { api } from './api.js';

export const commentService = {
  async list(diaryId) {
    const { data } = await api.get(`/diaries/${diaryId}/comments`);
    return data.comments;
  },

  /** parentId 를 주면 그 댓글에 다는 답글 */
  async create(diaryId, content, parentId) {
    const { data } = await api.post(`/diaries/${diaryId}/comments`, { content, parentId: parentId || undefined });
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
