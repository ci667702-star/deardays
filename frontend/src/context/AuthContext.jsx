import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { authService } from '../services/authService.js';
import { drafts } from '../utils/drafts.js';
import { tokenStorage } from '../utils/storage.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

/**
 * 로그인 상태를 관리한다.
 * status: 'loading'(토큰 확인 중) | 'authenticated' | 'guest'
 */
export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (tokenStorage.get() ? 'loading' : 'guest'));

  // 저장된 토큰이 있으면 서버에 확인해 로그인 상태를 복원한다.
  useEffect(() => {
    if (!tokenStorage.get()) return;
    let cancelled = false;
    authService
      .me()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        if (cancelled) return;
        tokenStorage.clear();
        setStatus('guest');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const userRef = useRef(user);
  userRef.current = user;

  // API가 401을 돌려주면 (토큰 만료 등) 로그아웃 처리
  useEffect(() => {
    const handleUnauthorized = (event) => {
      if (userRef.current) toast.error(event.detail || '로그인이 만료되었어요. 다시 로그인해 주세요.');
      setUser(null);
      setStatus('guest');
    };
    window.addEventListener('deardays:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('deardays:unauthorized', handleUnauthorized);
  }, [toast]);

  const login = useCallback(async ({ email, password, remember }) => {
    const { token, user: me } = await authService.login({ email, password });
    tokenStorage.set(token, remember);
    setUser(me);
    setStatus('authenticated');
    return me;
  }, []);

  const register = useCallback(async ({ email, nickname, password }) => {
    const { token, user: me } = await authService.register({ email, nickname, password });
    tokenStorage.set(token, true);
    setUser(me);
    setStatus('authenticated');
    return me;
  }, []);

  /** 직접 로그아웃할 때는 이 기기에 남은 임시 저장 일기도 지운다 (같이 쓰는 컴퓨터 대비) */
  const logout = useCallback(() => {
    if (userRef.current) drafts.clearUser(userRef.current.id);
    tokenStorage.clear();
    setUser(null);
    setStatus('guest');
  }, []);

  /** 비밀번호 변경 후 받은 새 토큰으로 교체 (이 기기는 로그인 유지) */
  const replaceToken = useCallback((token) => {
    tokenStorage.replace(token);
  }, []);

  /** 프로필 수정 후 화면 곳곳의 내 정보를 갱신 */
  const updateUser = useCallback((patch) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const value = useMemo(
    () => ({ user, status, isAuthenticated: status === 'authenticated', login, register, logout, updateUser, replaceToken }),
    [user, status, login, register, logout, updateUser, replaceToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth는 AuthProvider 안에서만 쓸 수 있어요.');
  return context;
}
