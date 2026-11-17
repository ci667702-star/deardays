import axios from 'axios';
import { tokenStorage } from '../utils/storage.js';

/** 백엔드 주소. 비어 있으면 같은 출처(개발 중에는 Vite 프록시)를 쓴다. */
export const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 토큰이 만료·무효가 되면 앱 전체에 알려 로그인 화면으로 돌려보낸다.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && hadToken) {
      tokenStorage.clear();
      window.dispatchEvent(new CustomEvent('deardays:unauthorized', { detail: error.response.data?.message }));
    }
    return Promise.reject(error);
  },
);

/** 서버가 준 '/uploads/...' 경로를 브라우저에서 열 수 있는 주소로 */
export function assetUrl(path) {
  if (!path) return null;
  return path.startsWith('/uploads/') ? `${API_ORIGIN}${path}` : path;
}
