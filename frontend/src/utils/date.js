// 일기 날짜는 'YYYY-MM-DD' 문자열로 주고받는다. (시간대 영향 없음)

const pad = (n) => String(n).padStart(2, '0');

/** 사용자 기기 기준 오늘 날짜 'YYYY-MM-DD' */
export function todayString(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function monthString(year, monthIndex) {
  return `${year}-${pad(monthIndex + 1)}`;
}

export function parseDateString(value) {
  const [y, m, d] = value.split('-').map(Number);
  return { year: y, monthIndex: m - 1, day: d };
}

export function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false;
  const { year, monthIndex, day } = parseDateString(value);
  const date = new Date(Date.UTC(year, monthIndex, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === monthIndex && date.getUTCDate() === day;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function weekdayOf(value) {
  const { year, monthIndex, day } = parseDateString(value);
  return WEEKDAYS[new Date(Date.UTC(year, monthIndex, day)).getUTCDay()];
}

/** '2026-11-15' → '2026년 11월 15일 일요일' */
export function formatDiaryDate(value, { withYear = true, withWeekday = true } = {}) {
  if (!value) return '';
  const { year, monthIndex, day } = parseDateString(value);
  const parts = [];
  if (withYear) parts.push(`${year}년`);
  parts.push(`${monthIndex + 1}월 ${day}일`);
  if (withWeekday) parts.push(`${weekdayOf(value)}요일`);
  return parts.join(' ');
}

/** '2026-11-15' → '11.15 (일)' */
export function formatShortDate(value) {
  if (!value) return '';
  const { monthIndex, day } = parseDateString(value);
  return `${monthIndex + 1}.${pad(day)} (${weekdayOf(value)})`;
}

const dateTimeFormat = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

/** ISO 시각 → '2026년 11월 17일 오후 2:20' */
export function formatDateTime(iso) {
  return iso ? dateTimeFormat.format(new Date(iso)) : '';
}

/** ISO 시각 → '방금 전', '5분 전', '3시간 전', '2일 전', 그 이상은 날짜 */
export function formatRelative(iso, now = Date.now()) {
  if (!iso) return '';
  const diff = Math.max(0, now - new Date(iso).getTime());
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return '방금 전';
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}일 전`;
  return formatDateTime(iso);
}

/** 두 ISO 시각이 1분 이상 차이 나면 수정된 것으로 본다. */
export function wasEdited(createdAt, updatedAt) {
  return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 60 * 1000;
}

/** 가입일로부터 며칠째인지 (가입 당일 = 1일째) */
export function daysSince(iso, now = new Date()) {
  const start = new Date(iso);
  const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((today - startDay) / (24 * 60 * 60 * 1000)) + 1;
}

/** 달력 칸: 해당 월을 일요일 시작 6주(42칸) 격자로 */
export function buildMonthGrid(year, monthIndex) {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const startOffset = first.getUTCDay();
  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(Date.UTC(year, monthIndex, 1 - startOffset + i));
    const value = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
    cells.push({
      value,
      day: date.getUTCDate(),
      weekday: date.getUTCDay(),
      inMonth: date.getUTCMonth() === monthIndex,
    });
  }
  return cells;
}

export { WEEKDAYS };
