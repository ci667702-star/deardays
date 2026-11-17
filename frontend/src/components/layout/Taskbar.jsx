import { useCallback, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRooms } from '../../context/RoomContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useClock } from '../../hooks/useClock.js';
import PixelIcon from '../ui/PixelIcon.jsx';
import { NAV_ITEMS } from './navItems.js';
import NotificationTray from './NotificationTray.jsx';
import StartMenu from './StartMenu.jsx';

const clockFormat = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' });
const fullDateFormat = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'full' });

export default function Taskbar() {
  const { user, logout } = useAuth();
  const { currentRoom } = useRooms();
  const toast = useToast();
  const navigate = useNavigate();
  const now = useClock();
  const [menuOpen, setMenuOpen] = useState(false);
  const startRef = useRef(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    toast.info('로그아웃했어요. 또 만나요!');
    navigate('/login', { replace: true });
  };

  return (
    <>
      <StartMenu open={menuOpen} onClose={closeMenu} onLogout={handleLogout} anchorRef={startRef} user={user} />
      <nav className="taskbar" aria-label="작업 표시줄">
        <button
          ref={startRef}
          type="button"
          className="task-btn shrink-0 font-bold"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="시작 메뉴"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <PixelIcon name="heart" size={20} />
          <span className="start-label">시작</span>
        </button>

        <span className="mx-0.5 h-full w-[2px] shrink-0 shadow-[inset_1px_0_var(--color-shade),inset_-1px_0_var(--color-hilite)]" aria-hidden="true" />

        <div className="flex min-w-0 flex-1 gap-1 overflow-hidden">
          {NAV_ITEMS.filter((item) => item.taskbar).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="task-btn max-w-[160px] flex-1 justify-center lg:flex-none lg:justify-start"
              title={item.label}
            >
              <PixelIcon name={item.icon} size={18} />
              <span className="hidden truncate lg:inline">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="tray shrink-0 !gap-2 !px-1.5 sm:!gap-[10px] sm:!px-2.5">
          <NotificationTray />
          {currentRoom && (
            <span className="hidden max-w-[160px] items-center gap-1.5 xl:flex" title={`지금 보고 있는 공간: ${currentRoom.name}`}>
              <PixelIcon name="heartSmall" size={12} />
              <span className="truncate">{currentRoom.name}</span>
            </span>
          )}
          <time dateTime={now.toISOString()} title={fullDateFormat.format(now)}>
            {clockFormat.format(now)}
          </time>
        </div>
      </nav>
    </>
  );
}
