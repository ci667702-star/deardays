import { api } from './api.js';

export const userService = {
  /** 내 정보 + 통계 + 참여 공간 */
  async getMyPage() {
    const { data } = await api.get('/users/me');
    return data.user;
  },

  async updateProfile({ nickname, introduction }) {
    const { data } = await api.put('/users/me', { nickname, introduction });
    return data.user;
  },

  async uploadProfileImage(file) {
    const form = new FormData();
    form.append('image', file);
    const { data } = await api.post('/users/me/profile-image', form);
    return data.user;
  },

  async removeProfileImage() {
    const { data } = await api.delete('/users/me/profile-image');
    return data.user;
  },

  /** @returns {Promise<string>} 새 로그인 토큰 (다른 기기의 토큰은 무효가 됨) */
  async changePassword({ currentPassword, newPassword }) {
    const { data } = await api.put('/users/me/password', { currentPassword, newPassword });
    return data.token;
  },

  async deleteAccount(password) {
    await api.delete('/users/me', { data: { password } });
  },
};
