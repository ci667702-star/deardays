// 브라우저 저장소 접근은 사생활 보호 모드 등에서 실패할 수 있으므로 모두 감싼다.

const TOKEN_KEY = 'deardays:token';

function safe(fn, fallback = null) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** '로그인 상태 유지'를 고르면 localStorage, 아니면 탭을 닫으면 사라지는 sessionStorage */
export const tokenStorage = {
  get() {
    return safe(() => localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY));
  },
  set(token, remember) {
    safe(() => {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
    });
  },
  clear() {
    safe(() => {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    });
  },
  /** 비밀번호를 바꿔 받은 새 토큰을, 지금 쓰고 있는 저장소(유지/탭 한정)에 그대로 바꿔 넣는다 */
  replace(token) {
    const remember = safe(() => localStorage.getItem(TOKEN_KEY) !== null, true);
    this.set(token, remember);
  },
};

export const prefs = {
  get(key) {
    return safe(() => localStorage.getItem(`deardays:${key}`));
  },
  set(key, value) {
    safe(() => localStorage.setItem(`deardays:${key}`, value));
  },
};
