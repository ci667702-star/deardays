import { api } from './api.js';

export const letterService = {
  /** @returns {Promise<{ received, sent, counts: { unopened, sealed } }>} */
  async list(roomId) {
    const { data } = await api.get('/letters', { params: { roomId } });
    return data;
  },

  /** 받는 사람이 여는 날 전에 열면 403 (code: LETTER_SEALED) */
  async get(id) {
    const { data } = await api.get(`/letters/${id}`);
    return data.letter;
  },

  async create({ roomId, recipientId, title, content, openAt }) {
    const { data } = await api.post('/letters', { roomId, recipientId, title, content, openAt });
    return data.letter;
  },

  async remove(id) {
    await api.delete(`/letters/${id}`);
  },
};
