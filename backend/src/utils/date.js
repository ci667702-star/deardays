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
