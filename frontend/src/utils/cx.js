/** 조건부 className 합치기: cx('a', cond && 'b') */
export function cx(...values) {
  return values.filter(Boolean).join(' ');
}
