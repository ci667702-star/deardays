import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './fonts.css';
import '@fontsource/gowun-batang/400.css';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

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
