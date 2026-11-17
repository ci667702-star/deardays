import { createHash, timingSafeEqual } from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/HttpError.js';
import { fromDbDate, localTodayString, toDbDate } from '../utils/date.js';
import { toMe, toTopicForAdmin } from '../utils/serializers.js';

const ADMIN_DISABLED = () =>
  HttpError.forbidden('관리자 기능이 꺼져 있어요. 서버의 .env 에 ADMIN_PASSWORD 를 8자 이상으로 정해 주세요.', 'ADMIN_DISABLED');

const TOPIC_NOT_FOUND = () => HttpError.notFound('주제를 찾을 수 없어요.', 'TOPIC_NOT_FOUND');
const DATE_TAKEN = (date) => HttpError.conflict(`${date}에는 이미 주제가 있어요. 다른 날짜를 골라 주세요.`, 'TOPIC_DATE_TAKEN');

/** 길이가 달라도 걸리는 시간이 같도록 해시끼리 비교한다 */
function passwordMatches(input) {
  const digest = (value) => createHash('sha256').update(String(value), 'utf8').digest();
  return timingSafeEqual(digest(input), digest(env.adminPassword));
}

export function getStatus(user) {
  return { enabled: Boolean(env.adminPassword), isAdmin: Boolean(env.adminPassword) && user.isAdmin };
}

/** 관리자 비밀번호가 맞으면 이 계정을 관리자로 */
export async function unlock(userId, { password }) {
  if (!env.adminPassword) throw ADMIN_DISABLED();
  if (!passwordMatches(password)) {
    throw HttpError.badRequest('관리자 비밀번호가 맞지 않아요.', 'WRONG_ADMIN_PASSWORD');
  }
  const user = await prisma.user.update({ where: { id: userId }, data: { isAdmin: true } });
  return toMe(user);
}

/** 관리자 그만하기 */
export async function lock(userId) {
  const user = await prisma.user.update({ where: { id: userId }, data: { isAdmin: false } });
  return toMe(user);
}

/** 오늘부터 주제가 비어 있는 날짜를 count 개 (오늘 포함) */
async function nextEmptyDates(count, db = prisma) {
  const today = localTodayString();
  const taken = await db.dailyTopic.findMany({
    where: { date: { gte: toDbDate(today) } },
    select: { date: true },
  });
  const takenSet = new Set(taken.map((topic) => fromDbDate(topic.date)));

  const dates = [];
  const cursor = toDbDate(today);
  while (dates.length < count) {
    const value = fromDbDate(cursor);
    if (!takenSet.has(value)) dates.push(value);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

const withCount = { _count: { select: { diaries: true } } };

export async function listTopics({ scope, page, limit }) {
  const today = toDbDate(localTodayString());
  const where = scope === 'past' ? { date: { lt: today } } : { date: { gte: today } };
  const [total, topics, [nextDate]] = await Promise.all([
    prisma.dailyTopic.count({ where }),
    prisma.dailyTopic.findMany({
      where,
      include: withCount,
      // 앞으로 올 주제는 가까운 날부터, 지난 주제는 최근 것부터
      orderBy: { date: scope === 'past' ? 'desc' : 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    nextEmptyDates(1),
  ]);
  return {
    items: topics.map(toTopicForAdmin),
    page,
    limit,
    total,
    hasMore: page * limit < total,
    scope,
    today: localTodayString(),
    nextEmptyDate: nextDate,
  };
}

async function assertDateFree(date, exceptId = null) {
  const existing = await prisma.dailyTopic.findUnique({ where: { date: toDbDate(date) }, select: { id: true } });
  if (existing && existing.id !== exceptId) throw DATE_TAKEN(date);
}

export async function createTopic(userId, { content, date }) {
  const target = date ?? (await nextEmptyDates(1))[0];
  await assertDateFree(target);
  try {
    const topic = await prisma.dailyTopic.create({
      data: { content, date: toDbDate(target), createdById: userId },
      include: withCount,
    });
    return toTopicForAdmin(topic);
  } catch (error) {
    if (error.code === 'P2002') throw DATE_TAKEN(target); // 동시에 같은 날짜로 넣은 경우
    throw error;
  }
}

/** 여러 주제를 오늘부터 비어 있는 날짜에 차례로 넣는다 */
export async function createTopicsBulk(userId, { contents }) {
  try {
    return await prisma.$transaction(async (tx) => {
      const dates = await nextEmptyDates(contents.length, tx);
      await tx.dailyTopic.createMany({
        data: contents.map((content, index) => ({ content, date: toDbDate(dates[index]), createdById: userId })),
      });
      const created = await tx.dailyTopic.findMany({
        where: { date: { in: dates.map(toDbDate) } },
        include: withCount,
        orderBy: { date: 'asc' },
      });
      return created.map(toTopicForAdmin);
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw HttpError.conflict('그 사이에 다른 주제가 들어왔어요. 한 번 더 넣어 주세요.', 'TOPIC_DATE_TAKEN');
    }
    throw error;
  }
}

export async function updateTopic(topicId, { content, date }) {
  const existing = await prisma.dailyTopic.findUnique({ where: { id: topicId }, select: { id: true } });
  if (!existing) throw TOPIC_NOT_FOUND();
  await assertDateFree(date, topicId);
  try {
    const topic = await prisma.dailyTopic.update({
      where: { id: topicId },
      data: { content, date: toDbDate(date) },
      include: withCount,
    });
    return toTopicForAdmin(topic);
  } catch (error) {
    if (error.code === 'P2002') throw DATE_TAKEN(date);
    throw error;
  }
}

/** 주제를 지워도 그 주제로 쓴 일기는 남는다 (주제 표시만 사라짐) */
export async function deleteTopic(topicId) {
  const { count } = await prisma.dailyTopic.deleteMany({ where: { id: topicId } });
  if (count === 0) throw TOPIC_NOT_FOUND();
}

export { ADMIN_DISABLED };
