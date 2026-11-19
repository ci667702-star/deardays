import { prefs } from './storage.js';

/** 색 구성표. id 는 index.css 의 [data-theme='...'] 블록과 같아야 한다. */
export const THEMES = [
  {
    id: 'rose',
    name: '벚꽃 (밝은 분홍)',
    description: '옛 윈도우 창 그대로, 밝은 벚꽃색 바탕과 하얀빛 창, 산딸기색 제목 표시줄',
    themeColor: '#ffffff',
  },
  {
    id: 'classic',
    name: '클래식 (회색)',
    description: '옛 윈도우 그대로: 회색 창, 청록 바탕, 남색 제목 표시줄',
    themeColor: '#008080',
  },
  {
    id: 'blue',
    name: '파란색',
    description: ' 옛 윈도우 그대로: 노란 창, 파란 바탕, 바다색 제목 표시줄',
    themeColor: '#A8D0EF'
  }
];

export const DEFAULT_THEME = 'rose';

// 분홍 테마를 기본으로 바꾸면서 저장 이름을 새로 정했다. 예전 값은 읽지 않고 기본 테마로 시작한다.
const STORAGE_KEY = 'theme-v2';

export const isTheme = (id) => THEMES.some((theme) => theme.id === id);

export function readStoredTheme() {
  const stored = prefs.get(STORAGE_KEY);
  return isTheme(stored) ? stored : DEFAULT_THEME;
}

/** <html data-theme> 과 브라우저 주소창 색을 바꾸고, 이 기기에 기억한다. */
export function applyTheme(id) {
  const theme = THEMES.find((item) => item.id === id) ?? THEMES[0];
  document.documentElement.dataset.theme = theme.id;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.themeColor);
  prefs.set(STORAGE_KEY, theme.id);
}
