import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import DesktopBackdrop from '../components/desktop/DesktopBackdrop.jsx';
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx';
import { Loading } from '../components/ui/Feedback.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import Window from '../components/ui/Window.jsx';
import ScreenSaver from '../components/layout/ScreenSaver.jsx';
import { LeftGadgets, RightGadgets } from '../components/layout/SideGadgets.jsx';
import Taskbar from '../components/layout/Taskbar.jsx';
import { prefetchPages } from '../pages/lazyPages.js';

function PageLoading() {
  return (
    <Window title="DearDays" icon={<PixelIcon name="hourglass" size={14} />} animate={false}>
      <Loading label="화면을 여는 중..." />
    </Window>
  );
}

/** 로그인 후 화면: 도트 하늘 바탕 + 창들이 놓이는 영역 + 작업 표시줄 (화면 이동은 시작 메뉴와 작업 표시줄로) */
export default function DesktopLayout() {
  const { pathname } = useLocation();

  // 처음 화면이 뜬 뒤 한가할 때 나머지 화면 코드를 미리 받아 둔다
  useEffect(() => {
    prefetchPages();
  }, []);

  return (
    <div
      className="relative min-h-dvh"
      style={{ paddingTop: 'calc(var(--taskbar-h) + var(--safe-top))', paddingBottom: 'calc(var(--safe-bottom) + 20px)' }}
    >
      <DesktopBackdrop />
      <Taskbar />
      <ScreenSaver />
      {/* 아주 넓은 화면에서는 본문 양옆에 작은 창(함께한 날·시계 / 이번 주·메모장)을 둔다 */}
      <div className="relative z-[1] mx-auto max-w-[1440px] px-2.5 pt-2.5 sm:px-5 sm:pt-5 min-[1600px]:grid min-[1600px]:max-w-[1920px] min-[1600px]:grid-cols-[250px_minmax(0,1fr)_250px] min-[1600px]:items-start min-[1600px]:gap-5">
        <aside aria-label="왼쪽 작은 창" className="sticky top-[calc(var(--taskbar-h)+20px)] hidden min-[1600px]:block">
          <LeftGadgets />
        </aside>
        <main className="min-w-0">
          {/* 페이지를 옮기면 오류 상태도 초기화되도록 경로를 key 로 쓴다 */}
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<PageLoading />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
        <aside aria-label="오른쪽 작은 창" className="sticky top-[calc(var(--taskbar-h)+20px)] hidden min-[1600px]:block">
          <RightGadgets />
        </aside>
      </div>
    </div>
  );
}
