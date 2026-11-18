import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/HttpError.js';
import { fromDbDate, localTodayString, toDbDate } from '../utils/date.js';
import { toPublicUser } from '../utils/serializers.js';
import { assertRoomMember } from './roomService.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOT_FOUND = () => HttpError.notFound('기념일을 찾을 수 없어요. 지워졌을 수도 있어요.', 'ANNIVERSARY_NOT_FOUND');

const isLeap = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/** 그해의 같은 날 (2월 29일은 윤년이 아니면 2월 28일) */
function sameDayIn(year, month, day) {
  const d = month === 2 && day === 29 && !isLeap(year) ? 28 : day;
  return new Date(Date.UTC(year, month - 1, d));
}

/**
 * 다음에 돌아오는 날과 D-day.
 * - 해마다(yearly): 오늘이거나 앞으로 가장 가까운 그날. years 는 몇 번째인지 (생일이면 나이 셈에 쓰지 않고 '몇 주년'용)
 * - 한 번(yearly 아님): 그 날짜. 지났으면 dday 가 음수
 */
export function nextOccurrence(dateString, yearly, todayString = localTodayString()) {
  const today = toDbDate(todayString);
  const [y, m, d] = dateString.split('-').map(Number);
  let next = toDbDate(dateString);
  if (yearly) {
    next = sameDayIn(today.getUTCFullYear(), m, d);
    if (next < today) next = sameDayIn(today.getUTCFullYear() + 1, m, d);
  }
  return {
    nextDate: fromDbDate(next),
    dday: Math.round((next - today) / DAY_MS),
    years: yearly ? next.getUTCFullYear() - y : 0,
  };
}

function toAnniversary(item, viewerId, todayString) {
  const date = fromDbDate(item.date);
  return {
    id: item.id,
    roomId: item.diaryRoomId,
    title: item.title,
    date,
    yearly: item.yearly,
    ...nextOccurrence(date, item.yearly, todayString),
    creator: toPublicUser(item.creator),
    isMine: item.creatorId === viewerId,
    createdAt: item.createdAt,
  };
}

/** 공간의 기념일: 다가오는 날(오늘 포함)이 가까운 순서로, 지난 날(한 번만 있는 날)은 뒤에 최근 순으로 */
export async function listAnniversaries(userId, roomId) {
  await assertRoomMember(roomId, userId);
  const today = localTodayString();
  const items = await prisma.anniversary.findMany({ where: { diaryRoomId: roomId }, include: { creator: true } });
  return items
    .map((item) => toAnniversary(item, userId, today))
    .sort((a, b) => {
      if ((a.dday >= 0) !== (b.dday >= 0)) return a.dday >= 0 ? -1 : 1;
      return a.dday >= 0 ? a.dday - b.dday : b.dday - a.dday;
    });
}

export async function createAnniversary(userId, roomId, { title, date, yearly }) {
  await assertRoomMember(roomId, userId);
  const count = await prisma.anniversary.count({ where: { diaryRoomId: roomId } });
  if (count >= 100) throw HttpError.badRequest('기념일은 한 공간에 100개까지 넣을 수 있어요.', 'TOO_MANY_ANNIVERSARIES');
  const item = await prisma.anniversary.create({
    data: { diaryRoomId: roomId, creatorId: userId, title, date: toDbDate(date), yearly },
    include: { creator: true },
  });
  return toAnniversary(item, userId, localTodayString());
}

/** 공간 멤버인지, 그리고 넣은 사람인지 확인 */
async function findOwn(userId, id) {
  const item = await prisma.anniversary.findUnique({ where: { id }, select: { id: true, diaryRoomId: true, creatorId: true } });
  if (!item) throw NOT_FOUND();
  const membership = await prisma.diaryRoomMember.findUnique({
    where: { userId_diaryRoomId: { userId, diaryRoomId: item.diaryRoomId } },
    select: { id: true },
  });
  if (!membership) throw NOT_FOUND();
  if (item.creatorId !== userId) throw HttpError.forbidden('내가 넣은 기념일만 고치거나 지울 수 있어요.', 'NOT_CREATOR');
  return item;
}

export async function updateAnniversary(userId, id, { title, date, yearly }) {
  await findOwn(userId, id);
  const item = await prisma.anniversary.update({
    where: { id },
    data: { title, date: toDbDate(date), yearly },
    include: { creator: true },
  });
  return toAnniversary(item, userId, localTodayString());
}

export async function deleteAnniversary(userId, id) {
  await findOwn(userId, id);
  await prisma.anniversary.delete({ where: { id } });
}
