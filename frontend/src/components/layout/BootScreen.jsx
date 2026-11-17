import Logo from './Logo.jsx';

/** 저장된 로그인 정보를 확인하는 동안 보여 주는 시작 화면 */
export default function BootScreen() {
  return (
    <div role="status" className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-desk-text">
      <Logo />
      <div className="progress w-56" aria-hidden="true">
        <span />
      </div>
      <p className="font-small text-[12px]">일기장을 여는 중...</p>
    </div>
  );
}
