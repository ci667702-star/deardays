import { api } from './api.js';

export const roomService = {
  async list() {
    const { data } = await api.get('/rooms');
    return data.rooms;
  },

  async get(roomId) {
    const { data } = await api.get(`/rooms/${roomId}`);
    return data.room;
  },

  async create(name) {
    const { data } = await api.post('/rooms', { name });
    return data.room;
  },

  async join(inviteCode) {
    const { data } = await api.post('/rooms/join', { inviteCode });
    return data.room;
  },

  async rename(roomId, name) {
    const { data } = await api.patch(`/rooms/${roomId}`, { name });
    return data.room;
  },

  async regenerateInviteCode(roomId) {
    const { data } = await api.post(`/rooms/${roomId}/invite-code`);
    return data.room;
  },

  async leave(roomId) {
    const { data } = await api.delete(`/rooms/${roomId}/members/me`);
    return data; // { roomDeleted }
  },
};
