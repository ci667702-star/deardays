import { Suspense, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx';
import { Loading } from '../components/ui/Feedback.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import Window from '../components/ui/Window.jsx';
import Taskbar from '../components/layout/Taskbar.jsx';
import { NAV_ITEMS } from '../components/layout/navItems.js';
import { prefetchPages } from '../pages/lazyPages.js';

function PageLoading() {
  return (
    <Window title="DearDays" icon={<PixelIcon name="hourglass" size={14} />} animate={false}>
      <Loading label="화면을 여는 중..." />
    </Window>
  );
}

/** 로그인 후 화면: 바탕화면 아이콘 + 창들이 놓이는 영역 + 작업 표시줄 */
export default function DesktopLayout() {
  const { pathname } = useLocation();

  // 처음 화면이 뜬 뒤 한가할 때 나머지 화면 코드를 미리 받아 둔다
  useEffect(() => {
    prefetchPages();
  }, []);

  return (
    <div className="min-h-dvh" style={{ paddingBottom: 'calc(var(--taskbar-h) + var(--safe-bottom) + 20px)' }}>
      <div className="mx-auto flex max-w-[1280px] gap-4 px-2.5 pt-2.5 sm:px-5 sm:pt-5">
        <nav aria-label="바탕 화면 바로 가기" className="hidden shrink-0 flex-col gap-3 lg:flex">
          {NAV_ITEMS.filter((item) => item.desktopLabel).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="desk-icon">
              <PixelIcon name={item.icon} size={40} palette={item.palette} />
              <span className="desk-icon-label">{item.desktopLabel}</span>
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0 flex-1">
          {/* 페이지를 옮기면 오류 상태도 초기화되도록 경로를 key 로 쓴다 */}
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<PageLoading />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <Taskbar />
    </div>
  );
}
