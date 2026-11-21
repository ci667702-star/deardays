import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './fonts.css';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { isPhoneApp, setupPhoneApp } from './utils/nativeApp.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <ThemeProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ThemeProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);

// 휴대폰·브라우저 푸시 알림을 받는 서비스 워커 (https 또는 localhost 에서만 동작).
// 휴대폰 앱(Capacitor) 안에서는 쓰지 않는다: 화면 파일이 앱 안에 있어 웹 푸시를 받을 수 없다.
if ('serviceWorker' in navigator && window.isSecureContext && !window.deardaysDesktop && !isPhoneApp()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// 휴대폰 앱: 뒤로 버튼
setupPhoneApp();
