import { NavLink, Outlet, useLocation } from 'react-router';
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import Taskbar from '../components/layout/Taskbar.jsx';
import { NAV_ITEMS } from '../components/layout/navItems.js';

/** 로그인 후 화면: 바탕화면 아이콘 + 창들이 놓이는 영역 + 작업 표시줄 */
export default function DesktopLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-dvh" style={{ paddingBottom: 'calc(var(--taskbar-h) + 20px)' }}>
      <div className="mx-auto flex max-w-[1280px] gap-4 px-3 pt-3 sm:px-5 sm:pt-5">
        <nav aria-label="바탕 화면 바로 가기" className="hidden shrink-0 flex-col gap-3 lg:flex">
          {NAV_ITEMS.filter((item) => item.desktopLabel).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="desk-icon">
              <PixelIcon name={item.icon} size={40} />
              <span className="desk-icon-label">{item.desktopLabel}</span>
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0 flex-1">
          {/* 페이지를 옮기면 오류 상태도 초기화되도록 경로를 key 로 쓴다 */}
          <ErrorBoundary key={pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <Taskbar />
    </div>
  );
}
