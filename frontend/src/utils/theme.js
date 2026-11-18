import { prefs } from './storage.js';

/** 색 구성표. id 는 index.css 의 [data-theme='...'] 블록과 같아야 한다. */
export const THEMES = [
  {
    id: 'strawberry',
    name: '딸기우유 (핑크)',
    description: '핑크 바탕과 창, 초코색 테두리, 친구는 민트, 메모는 바나나 크림',
    themeColor: '#ffa2b9',
  },
  {
    id: 'classic',
    name: '클래식 (회색)',
    description: '옛 윈도우 그대로: 회색 창, 청록 바탕, 남색 제목 표시줄',
    themeColor: '#008080',
  },
];

export const DEFAULT_THEME = 'strawberry';

// 핑크 테마를 기본으로 바꾸면서 저장 이름을 새로 정했다. 예전 값(클래식 자동 저장, 자두)은 읽지 않고 핑크로 시작한다.
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
