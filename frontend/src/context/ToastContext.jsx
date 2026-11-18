import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import PixelIcon from '../components/ui/PixelIcon.jsx';

const ToastContext = createContext(null);

const ICON_BY_TYPE = { success: 'heartSmall', error: 'warning', info: 'bulb' };

/** 작업 표시줄 위에 뜨는 말풍선 알림 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const notify = useCallback(
    (message, { type = 'info', duration = 3500 } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((list) => [...list.slice(-2), { id, message, type }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      notify,
      success: (message) => notify(message, { type: 'success' }),
      error: (message) => notify(message, { type: 'error', duration: 5500 }),
      info: (message) => notify(message, { type: 'info' }),
    }),
    [notify],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-3 z-[80] flex w-[min(340px,calc(100vw-24px))] flex-col gap-4"
        style={{ top: 'calc(var(--taskbar-h) + var(--safe-top) + 14px)' }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} role={toast.type === 'error' ? 'alert' : 'status'} className="balloon pointer-events-auto win-open">
            <div className="flex items-start gap-3">
              <PixelIcon name={ICON_BY_TYPE[toast.type]} size={toast.type === 'success' ? 18 : 22} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-[15px] leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="win-title-btn shrink-0"
                aria-label="알림 닫기"
              >
                <X size={11} strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast는 ToastProvider 안에서만 쓸 수 있어요.');
  return context;
}
