import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus.js';
import { notificationService } from '../services/notificationService.js';
import { describeNotification } from '../utils/notifications.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const NotificationContext = createContext(null);
const POLL_MS = 30000;

/**
 * 새 소식: 안 읽은 개수를 30초마다(화면이 보일 때), 페이지를 옮길 때, 탭으로 돌아올 때 확인한다.
 * 개수가 늘면 가장 최근 소식을 말풍선으로 알려 준다.
 */
export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastCount = useRef(null);

  const setCount = useCallback((count) => {
    lastCount.current = count;
    setUnreadCount(count);
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.list();
      setItems(data.items);
      setCount(data.unreadCount);
      setError(null);
      return data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setCount]);

  const refreshCount = useCallback(async () => {
    try {
      const count = await notificationService.unreadCount();
      const previous = lastCount.current;
      setCount(count);
      if (previous === null) {
        // 처음 열 때 안내는 이 탭에서 한 번만 (새로 고칠 때마다 뜨지 않게, 개수가 바뀌었을 때만 다시)
        const key = `deardays:noticeShown:${user.id}`;
        let shown = null;
        try {
          shown = sessionStorage.getItem(key);
        } catch {
          // 저장소를 못 쓰는 환경이면 매번 안내
        }
        if (count > 0 && shown !== String(count)) {
          toast.info(`새 소식이 ${count}개 있어요. 작업 표시줄의 종을 눌러 보세요.`);
        }
        try {
          sessionStorage.setItem(key, String(count));
        } catch {
          // 무시
        }
      } else if (count > previous) {
        const data = await loadList();
        const newest = data?.items.find((item) => !item.isRead);
        if (newest) toast.info(describeNotification(newest, user.id).text);
      }
    } catch {
      // 네트워크가 잠깐 끊긴 경우 등: 다음 확인 때 다시 시도
    }
  }, [loadList, setCount, toast, user.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refreshCount();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [refreshCount]);

  // 처음과 페이지를 옮길 때마다 (일기를 열면 서버가 그 알림을 읽음으로 바꾸므로)
  useEffect(() => {
    refreshCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useRefreshOnFocus(refreshCount, { minInterval: 5000 });

  const markRead = useCallback(
    async (id) => {
      const target = items?.find((item) => item.id === id);
      if (target && !target.isRead) {
        setItems((list) => list.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
        setCount(Math.max(0, lastCount.current - 1));
      }
      try {
        await notificationService.markRead(id);
      } catch {
        // 읽음 표시 실패는 다음 목록 갱신 때 바로잡힌다
      }
    },
    [items, setCount],
  );

  const markAllRead = useCallback(async () => {
    setItems((list) => list?.map((item) => ({ ...item, isRead: true })) ?? list);
    setCount(0);
    try {
      await notificationService.markAllRead();
    } catch (err) {
      setError(err);
    }
  }, [setCount]);

  const value = useMemo(
    () => ({ unreadCount, items, loading, error, loadList, markRead, markAllRead, refreshCount }),
    [unreadCount, items, loading, error, loadList, markRead, markAllRead, refreshCount],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications는 NotificationProvider 안에서만 쓸 수 있어요.');
  return context;
}
