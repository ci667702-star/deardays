import { useEffect } from 'react';
import { anniversaryService } from '../services/anniversaryService.js';
import { useFetch } from './useFetch.js';

const CHANGED = 'deardays:anniversaries-changed';

/** 기념일을 넣거나 고치거나 지웠다고 알린다: 화면에 떠 있는 모든 기념일 목록이 새로 받는다 */
export function announceAnniversariesChanged() {
  window.dispatchEvent(new CustomEvent(CHANGED));
}

/** 공간의 기념일 목록 { data, loading, error, reload } */
export function useAnniversaries(roomId) {
  const result = useFetch(() => anniversaryService.list(roomId), [roomId], { enabled: Boolean(roomId) });
  const { reload } = result;
  useEffect(() => {
    window.addEventListener(CHANGED, reload);
    return () => window.removeEventListener(CHANGED, reload);
  }, [reload]);
  return result;
}
