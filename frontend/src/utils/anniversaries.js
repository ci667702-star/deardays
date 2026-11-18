// 기념일 계산 (서버 backend/src/services/anniversaryService.js 의 nextOccurrence 와 같은 규칙)

const isLeap = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
const pad = (n) => String(n).padStart(2, '0');

/** 그해의 그날 'YYYY-MM-DD' (2월 29일은 윤년이 아니면 2월 28일) */
function dayIn(year, month, day) {
  const d = month === 2 && day === 29 && !isLeap(year) ? 28 : day;
  return `${year}-${pad(month)}-${pad(d)}`;
}

/** 달력 한 달에 보일 기념일: Map<'YYYY-MM-DD', 기념일[]> */
export function anniversariesInMonth(items, year, monthIndex) {
  const map = new Map();
  const month = monthIndex + 1;
  for (const item of items ?? []) {
    const [y, m, d] = item.date.split('-').map(Number);
    let date = null;
    if (item.yearly) {
      if (m === month && year >= y) date = dayIn(year, m, d);
    } else if (y === year && m === month) {
      date = item.date;
    }
    if (!date) continue;
    if (!map.has(date)) map.set(date, []);
    map.get(date).push(item);
  }
  return map;
}

/** 'D-DAY' / 'D-12' / 'D+5' */
export function ddayLabel(dday) {
  if (dday === 0) return 'D-DAY';
  return dday > 0 ? `D-${dday}` : `D+${-dday}`;
}
