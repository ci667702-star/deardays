// 도장 (서버 backend/src/config/constants.js 의 STAMP_KINDS 와 같은 값)
// shape: round(동그라미), box(네모), double(겹동그라미)
export const STAMPS = [
  { kind: 'great', label: '참 잘했어요', color: '#c8233f', shape: 'round' },
  { kind: 'wow', label: '대박', color: '#7b3cc4', shape: 'double' },
  { kind: 'lol', label: 'ㅋㅋㅋ', color: '#d8640f', shape: 'box' },
  { kind: 'pat', label: '토닥토닥', color: '#23805a', shape: 'round' },
  { kind: 'same', label: '나도 나도', color: '#2858b4', shape: 'box' },
  { kind: 'best', label: '최고', color: '#b5122e', shape: 'double' },
];

export const stampOf = (kind) => STAMPS.find((stamp) => stamp.kind === kind) ?? null;

/** 같은 도장은 늘 같은 자리·각도에 찍히도록 번호로 정하는 작은 해시 */
function hash(value) {
  let h = 2166136261;
  for (const char of String(value)) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * 종이 오른쪽 아래에 도장들이 조금씩 겹치며 놓이는 자리.
 * index 0 이 가장 오른쪽. 돌아간 각도와 높이는 도장 번호로 정한다.
 */
export function stampPlacement(stampId, index) {
  const h = hash(stampId);
  return {
    right: 8 + index * 64 + (h % 14),
    bottom: 6 + ((h >> 4) % 22),
    rotate: ((h >> 9) % 31) - 16,
  };
}
