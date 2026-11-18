import { api } from './api.js';

/** 기념일 (D-day): 공간마다 */
export const anniversaryService = {
  async list(roomId) {
    const { data } = await api.get(`/rooms/${roomId}/anniversaries`);
    return data.items; // [{ id, title, date, yearly, nextDate, dday, years, creator, isMine }]
  },

  async create(roomId, { title, date, yearly }) {
    const { data } = await api.post(`/rooms/${roomId}/anniversaries`, { title, date, yearly });
    return data.anniversary;
  },

  async update(id, { title, date, yearly }) {
    const { data } = await api.put(`/anniversaries/${id}`, { title, date, yearly });
    return data.anniversary;
  },

  async remove(id) {
    await api.delete(`/anniversaries/${id}`);
  },
};
