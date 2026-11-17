import { api } from './api.js';

export const todoService = {
  /** @returns {Promise<{ items, counts: { total, done, open } }>} */
  async list(roomId) {
    const { data } = await api.get('/todos', { params: { roomId } });
    return data;
  },

  async create({ roomId, content, dueDate, assigneeId }) {
    const { data } = await api.post('/todos', { roomId, content, dueDate: dueDate || null, assigneeId: assigneeId ?? null });
    return data.todo;
  },

  async update(id, { content, dueDate, assigneeId }) {
    const { data } = await api.put(`/todos/${id}`, { content, dueDate: dueDate || null, assigneeId: assigneeId ?? null });
    return data.todo;
  },

  async setDone(id, isDone) {
    const { data } = await api.patch(`/todos/${id}/status`, { isDone });
    return data.todo;
  },

  async remove(id) {
    await api.delete(`/todos/${id}`);
  },
};
