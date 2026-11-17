// 일기 임시 저장 (이 기기의 localStorage). 사용자별로 키를 나눠 다른 계정에 섞이지 않게 한다.
const PREFIX = 'deardays:draft:';

const keyFor = (userId, scope) => `${PREFIX}${userId}:${scope}`;

function safe(fn, fallback = null) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** scope: 'new:<공간id>' 또는 'edit:<일기id>' */
export const drafts = {
  load(userId, scope) {
    return safe(() => {
      const raw = localStorage.getItem(keyFor(userId, scope));
      return raw ? JSON.parse(raw) : null;
    });
  },
  save(userId, scope, data) {
    safe(() => localStorage.setItem(keyFor(userId, scope), JSON.stringify({ ...data, savedAt: new Date().toISOString() })));
  },
  remove(userId, scope) {
    safe(() => localStorage.removeItem(keyFor(userId, scope)));
  },
  /** 로그아웃할 때 이 사용자의 임시 저장을 모두 지운다 (같이 쓰는 컴퓨터 대비) */
  clearUser(userId) {
    safe(() => {
      const prefix = `${PREFIX}${userId}:`;
      Object.keys(localStorage)
        .filter((key) => key.startsWith(prefix))
        .forEach((key) => localStorage.removeItem(key));
    });
  },
};
