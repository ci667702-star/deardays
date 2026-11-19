import { api } from './api.js';

/** 문의: 내 정보에서 관리자에게 보내고, 답변을 받아 본다 */
export const inquiryService = {
  async listMine() {
    const { data } = await api.get('/inquiries');
    return data.items;
  },

  async create({ category, content }) {
    const { data } = await api.post('/inquiries', { category, content });
    return data.inquiry;
  },

  async remove(id) {
    await api.delete(`/inquiries/${id}`);
  },
};
