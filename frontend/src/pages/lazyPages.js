import { lazy } from 'react';

// 페이지별로 코드를 나눠, 처음 열 때는 지금 화면에 필요한 코드만 내려받는다.
const loaders = {
  LoginPage: () => import('./LoginPage.jsx'),
  RegisterPage: () => import('./RegisterPage.jsx'),
  DashboardPage: () => import('./DashboardPage.jsx'),
  RoomPage: () => import('./RoomPage.jsx'),
  DiaryEditorPage: () => import('./DiaryEditorPage.jsx'),
  DiaryDetailPage: () => import('./DiaryDetailPage.jsx'),
  TodoPage: () => import('./TodoPage.jsx'),
  LettersPage: () => import('./LettersPage.jsx'),
  CalendarPage: () => import('./CalendarPage.jsx'),
  SearchPage: () => import('./SearchPage.jsx'),
  MyPage: () => import('./MyPage.jsx'),
  NotFoundPage: () => import('./NotFoundPage.jsx'),
};

export const Pages = Object.fromEntries(Object.entries(loaders).map(([name, load]) => [name, lazy(load)]));

/**
 * 로그인한 뒤 브라우저가 한가할 때 나머지 화면 코드를 미리 받아 둔다.
 * (처음 화면은 가볍게, 화면을 옮길 때는 기다림 없이)
 */
export function prefetchPages() {
  const run = () => {
    for (const [name, load] of Object.entries(loaders)) {
      if (name !== 'LoginPage' && name !== 'RegisterPage') load().catch(() => {});
    }
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 1500);
}
