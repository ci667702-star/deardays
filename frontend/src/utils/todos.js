import { formatShortDate, parseDateString, todayString } from './date.js';

const time = (value) => (value ? new Date(value).getTime() : 0);

/** 서버와 같은 정렬: 남은 일(기한 가까운 순 → 기한 없음) 먼저, 끝낸 일은 최근에 끝낸 순 */
export function sortTodos(todos) {
  return [...todos].sort((a, b) => {
    if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
    if (a.isDone) return time(b.doneAt) - time(a.doneAt) || b.id - a.id;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate) || a.id - b.id;
    if (a.dueDate || b.dueDate) return a.dueDate ? -1 : 1;
    return a.id - b.id;
  });
}

function daysBetween(from, to) {
  const a = parseDateString(from);
  const b = parseDateString(to);
  return Math.round((Date.UTC(b.year, b.monthIndex, b.day) - Date.UTC(a.year, a.monthIndex, a.day)) / 86400000);
}

export function isOverdue(todo, today = todayString()) {
  return Boolean(todo.dueDate && !todo.isDone && daysBetween(today, todo.dueDate) < 0);
}

/**
 * 기한 표시 문구와 강조 단계
 * tone: 'overdue' | 'today' | 'soon' | 'normal' | 'done'
 */
export function dueInfo(todo, today = todayString()) {
  if (!todo.dueDate) return null;
  if (todo.isDone) return { text: `${formatShortDate(todo.dueDate)}까지`, tone: 'done' };
  const diff = daysBetween(today, todo.dueDate);
  if (diff < 0) return { text: `기한 ${-diff}일 지남`, tone: 'overdue' };
  if (diff === 0) return { text: '오늘까지', tone: 'today' };
  if (diff === 1) return { text: '내일까지', tone: 'soon' };
  if (diff <= 6) return { text: `${formatShortDate(todo.dueDate)}까지 (D-${diff})`, tone: 'normal' };
  return { text: `${formatShortDate(todo.dueDate)}까지`, tone: 'normal' };
}

export function countTodos(items) {
  const done = items.filter((todo) => todo.isDone).length;
  return { total: items.length, done, open: items.length - done };
}
