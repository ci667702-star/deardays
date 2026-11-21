import { isPhoneApp } from '../utils/nativeApp.js';
import { api } from './api.js';

/** 서버 base64url 공개키 → 브라우저가 원하는 바이트 배열 */
function keyBytes(base64url) {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

const withTimeout = (promise, ms) => Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

/** 이 브라우저가 푸시 알림을 받을 수 있는지 */
export function pushSupport() {
  if (window.deardaysDesktop) return 'desktop-app';
  if (isPhoneApp()) return 'phone-app';
  if (!window.isSecureContext) return 'insecure';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    return ios ? 'ios-browser' : 'unsupported';
  }
  return 'ok';
}

/** 서비스 워커 (없으면 등록). 브라우저가 막으면 알기 쉬운 오류로 */
async function registration() {
  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (!existing) await navigator.serviceWorker.register('/sw.js');
    return await withTimeout(navigator.serviceWorker.ready, 8000);
  } catch {
    const error = new Error('이 브라우저에서는 알림 기능을 켤 수 없어요. 휴대폰의 크롬·사파리(홈 화면 앱)나 PC 크롬·엣지에서 켜 주세요.');
    error.code = 'SW_UNAVAILABLE';
    throw error;
  }
}

export const pushService = {
  async status() {
    const { data } = await api.get('/push');
    return data; // { enabled, publicKey, devices }
  },

  /** 이 기기의 지금 구독 (없으면 null). 기다리지 않고 바로 확인한다 */
  async currentSubscription() {
    if (pushSupport() !== 'ok') return null;
    const reg = await navigator.serviceWorker.getRegistration();
    return reg ? reg.pushManager.getSubscription() : null;
  },

  /** 알림 권한을 묻고, 이 기기를 구독해 서버에 등록한다 */
  async enable(publicKey) {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      const error = new Error('알림이 차단돼 있어요. 브라우저(또는 휴대폰) 설정에서 이 사이트의 알림을 허용해 주세요.');
      error.code = 'PERMISSION_DENIED';
      throw error;
    }
    const reg = await registration();
    let sub = await reg.pushManager.getSubscription();
    // 서버 키가 바뀌었으면 예전 구독을 지우고 새로
    const key = keyBytes(publicKey);
    const sameKey = sub?.options?.applicationServerKey
      ? new Uint8Array(sub.options.applicationServerKey).every((byte, i) => byte === key[i])
      : false;
    if (sub && !sameKey) {
      await sub.unsubscribe();
      sub = null;
    }
    sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    await api.post('/push/subscribe', sub.toJSON());
    return sub;
  },

  async disable() {
    const sub = await this.currentSubscription();
    if (!sub) return;
    await api.delete('/push/subscribe', { data: { endpoint: sub.endpoint } });
    await sub.unsubscribe();
  },

  async test() {
    const { data } = await api.post('/push/test');
    return data; // { sent, failed }
  },
};

/**
 * 로그아웃할 때: 이 기기로 오던 알림을 끊는다 (같이 쓰는 기기에 남의 알림이 오지 않게).
 * 로그인 토큰을 지우기 전에 부르므로 토큰을 직접 넘긴다. 실패해도 로그아웃은 막지 않는다.
 */
export async function forgetThisDevice(token) {
  try {
    if (pushSupport() !== 'ok' || !token) return;
    const reg = await withTimeout(navigator.serviceWorker.getRegistration(), 3000);
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await api.delete('/push/subscribe', { data: { endpoint: sub.endpoint }, headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    await sub.unsubscribe();
  } catch {
    // 알림 끊기에 실패해도 로그아웃은 계속
  }
}
