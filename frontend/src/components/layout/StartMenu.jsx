import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';
import { NAV_ITEMS } from './navItems.js';

/** 시작 메뉴: 왼쪽 세로 띠 + 메뉴 항목. 위/아래 화살표로 이동, Esc·바깥 클릭으로 닫힘 */
export default function StartMenu({ open, onClose, onLogout, anchorRef, user }) {
  const menuRef = useRef(null);
  const { openDisplaySettings } = useTheme();

  useEffect(() => {
    if (!open) return undefined;
    const items = () => [...(menuRef.current?.querySelectorAll('[role="menuitem"]') ?? [])];
    items()[0]?.focus();

    const onPointerDown = (event) => {
      if (menuRef.current?.contains(event.target) || anchorRef.current?.contains(event.target)) return;
      onClose();
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        anchorRef.current?.focus();
        return;
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      const list = items();
      const index = list.indexOf(document.activeElement);
      const next = event.key === 'ArrowDown' ? (index + 1) % list.length : (index - 1 + list.length) % list.length;
      list[next]?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div ref={menuRef} className="start-menu win-open" role="menu" aria-label="시작 메뉴">
      <div className="start-banner" aria-hidden="true">
        DearDays
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <p className="font-small truncate px-3 pb-2 pt-1 text-[12px] text-muted">{user?.nickname}님의 일기장</p>
        {NAV_ITEMS.map((item) => (
          <Link key={item.to} to={item.to} role="menuitem" className="start-item" onClick={onClose}>
            <PixelIcon name={item.icon} size={24} palette={item.palette} />
            <span>{item.label}</span>
          </Link>
        ))}
        <hr className="etched mx-1 my-1" />
        <button
          type="button"
          role="menuitem"
          className="start-item"
          onClick={() => {
            onClose();
            openDisplaySettings();
          }}
        >
          <PixelIcon name="computer" size={24} />
          <span>화면 색 바꾸기...</span>
        </button>
        {window.deardaysDesktop && (
          <button
            type="button"
            role="menuitem"
            className="start-item"
            onClick={() => {
              onClose();
              window.deardaysDesktop.openServerSettings();
            }}
          >
            <PixelIcon name="folder" size={24} />
            <span>서버 주소 바꾸기...</span>
          </button>
        )}
        <button type="button" role="menuitem" className="start-item" onClick={onLogout}>
          <span className="grid w-6 place-items-center">
            <LogOut size={18} />
          </span>
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
}
