import { Suspense } from 'react';
import { Outlet } from 'react-router';
import DesktopBackdrop from '../components/desktop/DesktopBackdrop.jsx';
import Logo from '../components/layout/Logo.jsx';

/** 로그인·회원가입: 바탕화면 가운데 대화상자 하나 */
export default function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 px-3 py-10">
      <DesktopBackdrop />
      <div className="relative z-[1] flex flex-col items-center gap-2 text-center text-desk-text [text-shadow:var(--desk-label-shadow)]">
        <Logo />
        <p className="font-small text-[12px]">친구와 주고받는 교환 일기</p>
      </div>
      <div className="relative z-[1] w-full max-w-[460px]">
        <Suspense fallback={<div className="progress mx-auto w-48" aria-label="불러오는 중"><span /></div>}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
