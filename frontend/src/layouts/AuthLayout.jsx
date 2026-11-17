import { Outlet } from 'react-router';
import Logo from '../components/layout/Logo.jsx';

/** 로그인·회원가입: 바탕화면 가운데 대화상자 하나 */
export default function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-3 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <Logo />
        <p className="font-small text-[12px]">둘이서 주고받는 교환 일기</p>
      </div>
      <div className="w-full max-w-[460px]">
        <Outlet />
      </div>
    </div>
  );
}
