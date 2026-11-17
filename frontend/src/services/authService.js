import { api } from './api.js';

export const authService = {
  async register({ email, nickname, password }) {
    const { data } = await api.post('/auth/register', { email, nickname, password });
    return data; // { token, user }
  },

  async login({ email, password }) {
    const { data } = await api.post('/auth/login', { email, password });
    return data; // { token, user }
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data.user;
  },

  async checkEmail(email) {
    const { data } = await api.get('/auth/check-email', { params: { email } });
    return data.available;
  },
};
