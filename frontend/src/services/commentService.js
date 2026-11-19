import { api } from './api.js';

export const commentService = {
  async list(diaryId) {
    const { data } = await api.get(`/diaries/${diaryId}/comments`);
    return data.comments;
  },

  /** face: 얼굴 이모티콘(없으면 null). parentId 를 주면 그 댓글에 다는 답글 */
  async create(diaryId, { content, face = null, parentId }) {
    const { data } = await api.post(`/diaries/${diaryId}/comments`, { content, face, parentId: parentId || undefined });
    return data.comment;
  },

  async update(commentId, { content, face = null }) {
    const { data } = await api.put(`/comments/${commentId}`, { content, face });
    return data.comment;
  },

  async remove(commentId) {
    await api.delete(`/comments/${commentId}`);
  },
};
