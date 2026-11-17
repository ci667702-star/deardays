import { useEffect, useRef } from 'react';

/**
 * 다른 탭에 갔다가 돌아오면 callback 을 실행한다.
 * 친구가 그사이 쓴 일기·댓글이 화면에 반영되게 하기 위함. (너무 잦은 호출은 minInterval 로 막는다)
 */
export function useRefreshOnFocus(callback, { minInterval = 15000 } = {}) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const lastRun = useRef(Date.now());

  useEffect(() => {
    const handle = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastRun.current < minInterval) return;
      lastRun.current = Date.now();
      callbackRef.current();
    };
    document.addEventListener('visibilitychange', handle);
    window.addEventListener('focus', handle);
    return () => {
      document.removeEventListener('visibilitychange', handle);
      window.removeEventListener('focus', handle);
    };
  }, [minInterval]);
}
