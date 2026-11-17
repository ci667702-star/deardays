import { useEffect } from 'react';

/** 작성 중인 내용이 있으면 새로 고침·탭 닫기 전에 브라우저가 한 번 묻게 한다. */
export function useUnsavedChanges(dirty) {
  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}
