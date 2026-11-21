import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/** 휴대폰 앱(Capacitor) 안에서 실행 중인지 */
export const isPhoneApp = () => Capacitor.isNativePlatform();

/**
 * 휴대폰 앱의 '뒤로' 버튼:
 * 1) 작은 창(대화상자)이나 시작 메뉴가 떠 있으면 그것부터 닫고 (Esc 와 같게)
 * 2) 앞 화면이 있으면 앞 화면으로
 * 3) 첫 화면이면 앱을 뒤로 보낸다 (다시 열면 보던 화면 그대로)
 */
export function setupPhoneApp() {
  if (!isPhoneApp()) return;
  App.addListener('backButton', ({ canGoBack }) => {
    if (document.querySelector('[role="dialog"], [role="menu"]')) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      return;
    }
    if (canGoBack) window.history.back();
    else App.minimizeApp();
  });
}
