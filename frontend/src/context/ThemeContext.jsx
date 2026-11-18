import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import DisplaySettingsDialog from '../components/layout/DisplaySettingsDialog.jsx';
import { applyTheme, isTheme, readStoredTheme } from '../utils/theme.js';

const ThemeContext = createContext(null);

/** 색 구성표(장미/클래식)와 '디스플레이 등록 정보' 대화상자 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // index.html 의 인라인 스크립트가 먼저 적용하지만, 혹시 어긋나면 맞춘다.
  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback((id) => {
    if (!isTheme(id)) return;
    applyTheme(id);
    setThemeState(id);
  }, []);

  const openDisplaySettings = useCallback(() => setSettingsOpen(true), []);
  const closeDisplaySettings = useCallback(() => setSettingsOpen(false), []);

  const value = useMemo(() => ({ theme, setTheme, openDisplaySettings }), [theme, setTheme, openDisplaySettings]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <DisplaySettingsDialog open={settingsOpen} onClose={closeDisplaySettings} />
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme은 ThemeProvider 안에서만 쓸 수 있어요.');
  return context;
}
