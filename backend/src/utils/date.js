// 일기 날짜(diaryDate)는 MySQL DATE 컬럼에 저장한다.
// 시간대 혼동을 막기 위해 서버 안에서는 항상 UTC 자정 Date 객체로 다룬다.

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^\d{4}-\d{2}$/;

export function isValidDateString(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isValidMonthString(value) {
  if (!MONTH_PATTERN.test(value)) return false;
  const month = Number(value.slice(5, 7));
  return month >= 1 && month <= 12;
}

/** 'YYYY-MM-DD' → UTC 자정 Date */
export function toDbDate(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

/** DB Date → 'YYYY-MM-DD' */
export function fromDbDate(date) {
  return date.toISOString().slice(0, 10);
}

/** 'YYYY-MM' → 해당 월의 [시작, 다음 달 시작) 범위 */
export function monthRange(value) {
  const [year, month] = value.split('-').map(Number);
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

/**
 * 서버 시간대 기준 오늘 'YYYY-MM-DD'.
 * 편지가 열리는 날 판단에 쓰므로 서버 TZ 를 사용자와 같게 맞춘다 (docker-compose 는 Asia/Seoul).
 */
export function localTodayString(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** 'YYYY-MM-DD' 에 years 년을 더한 날짜 문자열 */
export function addYears(value, years) {
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y + years, m - 1, d));
  return date.toISOString().slice(0, 10);
}
