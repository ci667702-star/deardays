import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useRooms } from '../../context/RoomContext.jsx';
import { formatDateTime, formatRelative } from '../../utils/date.js';
import { cx } from '../../utils/cx.js';
import { describeNotification } from '../../utils/notifications.js';
import { EmptyState, ErrorMessage, Loading } from '../ui/Feedback.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';

/** 작업 표시줄 알림 영역의 종 + '새 소식' 창 */
export default function NotificationTray() {
  const { user } = useAuth();
  const { rooms, selectRoom } = useRooms();
  const { unreadCount, items, loading, error, loadList, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (panelRef.current?.contains(event.target) || buttonRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) loadList();
  };

  const go = (notification) => {
    const info = describeNotification(notification, user.id);
    markRead(notification.id);
    if (info.roomId && rooms.some((room) => room.id === info.roomId)) selectRoom(info.roomId);
    setOpen(false);
    navigate(info.to);
  };

  const label = unreadCount > 0 ? `새 소식 ${unreadCount}개` : '새 소식';

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className="relative grid size-7 shrink-0 place-items-center"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={label}
      >
        <PixelIcon name="bell" size={18} />
        {unreadCount > 0 && (
          <span className="font-small absolute -right-1.5 -top-1 min-w-4 bg-[#c8102e] px-0.5 text-center text-[10px] leading-4 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="새 소식"
          className="win win-open fixed right-1 z-[65] w-[min(380px,calc(100vw-8px))]"
          style={{ bottom: 'calc(var(--taskbar-h) + 2px)' }}
        >
          <div className="win-title">
            <span className="flex items-center gap-1.5">
              <PixelIcon name="bell" size={14} />
              새 소식
            </span>
            <button type="button" className="win-title-btn" onClick={() => setOpen(false)} aria-label="닫기">
              <X size={11} strokeWidth={3} />
            </button>
          </div>
          <div className="win-toolbar">
            <button type="button" className="btn-tool" onClick={markAllRead} disabled={unreadCount === 0}>
              <CheckCheck size={14} /> 모두 읽음
            </button>
            <span className="font-small ml-auto pr-1 text-[12px] text-muted">안 읽은 소식 {unreadCount}개</span>
          </div>
          <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
            {loading && !items && <Loading compact label="새 소식을 불러오는 중..." />}
            {error && <ErrorMessage error={error} onRetry={loadList} />}
            {items && items.length === 0 && <EmptyState icon="bell" title="새 소식이 없어요" description="친구가 일기를 쓰거나 댓글을 달면 여기에 알려 드려요." />}
            {items && items.length > 0 && (
              <ul className="sunken divide-y divide-rule">
                {items.map((notification) => {
                  const info = describeNotification(notification, user.id);
                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => go(notification)}
                        className={cx('list-row w-full grid-cols-[24px_minmax(0,1fr)_8px] text-left', !notification.isRead && 'bg-cream')}
                      >
                        <PixelIcon name={info.icon} size={20} palette={info.palette} />
                        <span className="min-w-0">
                          <span className={cx('block text-[14px] leading-snug', !notification.isRead && 'font-bold')}>{info.text}</span>
                          {info.detail && <span className="ink block truncate text-[13px] opacity-75">{info.detail}</span>}
                          <span className="list-meta block" title={formatDateTime(notification.createdAt)}>
                            {formatRelative(notification.createdAt)}
                            {notification.room && rooms.length > 1 ? ` · ${notification.room.name}` : ''}
                          </span>
                        </span>
                        <span
                          className={cx('size-2 self-center', !notification.isRead && 'bg-pink')}
                          aria-label={notification.isRead ? undefined : '안 읽음'}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
