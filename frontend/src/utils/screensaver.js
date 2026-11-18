import { prefs } from './storage.js';

// 화면 보호기 설정 (이 기기에만). '디스플레이 등록 정보'의 화면 보호기 탭에서 바꾼다.
const KEY = 'screensaver';
export const SCREENSAVER_MINUTES = [1, 3, 5, 10, 15];
export const DEFAULT_SCREENSAVER = { enabled: true, minutes: 5 };

export function readScreensaver() {
  try {
    const saved = JSON.parse(prefs.get(KEY) ?? 'null');
    if (!saved) return DEFAULT_SCREENSAVER;
    return {
      enabled: saved.enabled !== false,
      minutes: SCREENSAVER_MINUTES.includes(saved.minutes) ? saved.minutes : DEFAULT_SCREENSAVER.minutes,
    };
  } catch {
    return DEFAULT_SCREENSAVER;
  }
}

/** 저장하고, 켜져 있는 화면 보호기에게 알린다 */
export function saveScreensaver(settings) {
  prefs.set(KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent('deardays:screensaver', { detail: settings }));
}

/** 설정 창의 '미리 보기' */
export function previewScreensaver() {
  window.dispatchEvent(new CustomEvent('deardays:screensaver-preview'));
}
