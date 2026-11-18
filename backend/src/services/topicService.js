import { prisma } from '../config/prisma.js';
import { TOPIC_PROMPTS } from '../config/topicPrompts.js';
import { HttpError } from '../utils/HttpError.js';
import { localTodayString, toDbDate } from '../utils/date.js';
import { toPublicUser, toTopic } from '../utils/serializers.js';
import { assertRoomMember } from './roomService.js';

const TOPIC_NOT_FOUND = () => HttpError.notFound('주제를 찾을 수 없어요.', 'TOPIC_NOT_FOUND');

const DAY_MS = 24 * 60 * 60 * 1000;

/** 그날 자동으로 나올 글감: 날짜 순서대로 목록을 한 바퀴씩 돈다 */
export function promptForDate(date) {
  const day = Math.floor(toDbDate(date).getTime() / DAY_MS);
  return TOPIC_PROMPTS[((day % TOPIC_PROMPTS.length) + TOPIC_PROMPTS.length) % TOPIC_PROMPTS.length];
}

/**
 * 하루 하나 글쓰기: 오늘 관리자가 넣은 주제가 없으면 글감 목록에서 하나를 골라 오늘의 주제로 만든다.
 * 누가 먼저 열든 한 번만 만들어진다 (같은 날짜는 하나만: 동시에 만들면 먼저 만든 것을 쓴다).
 */
export async function ensureTodayTopic() {
  const date = toDbDate(localTodayString());
  const existing = await prisma.dailyTopic.findUnique({ where: { date } });
  if (existing) return existing;
  try {
    return await prisma.dailyTopic.create({ data: { date, content: promptForDate(localTodayString()), isAuto: true } });
  } catch (error) {
    if (error.code !== 'P2002') throw error;
    return prisma.dailyTopic.findUnique({ where: { date } });
  }
}

/** 오늘의 주제 (관리자가 넣지 않았으면 자동으로 고른 글감) */
export async function getTodayTopic() {
  const today = localTodayString();
  const topic = await ensureTodayTopic();
  return { date: today, topic: topic ? toTopic(topic) : null };
}

/**
 * 주제 하나. 아직 공개되지 않은(미래) 주제는 관리자에게만 보인다.
 * 공간을 함께 주면 그 공간에서 이 주제로 쓴 일기도 돌려준다.
 */
export async function getTopic(userId, topicId) {
  const [topic, user] = await Promise.all([
    prisma.dailyTopic.findUnique({ where: { id: topicId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } }),
  ]);
  if (!topic) throw TOPIC_NOT_FOUND();
  if (topic.date > toDbDate(localTodayString()) && !user?.isAdmin) throw TOPIC_NOT_FOUND();
  return toTopic(topic);
}

/**
 * 공간의 주제 기록: 오늘까지 공개된 주제를 최근 순으로, 그 주제로 이 공간에서 쓴 일기와 함께.
 */
export async function listRoomTopics(userId, { roomId, page, limit }) {
  await assertRoomMember(roomId, userId);
  await ensureTodayTopic();
  const where = { date: { lte: toDbDate(localTodayString()) } };

  const [total, topics] = await prisma.$transaction([
    prisma.dailyTopic.count({ where }),
    prisma.dailyTopic.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        diaries: {
          where: { diaryRoomId: roomId },
          select: { id: true, title: true, diaryDate: true, authorId: true, author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
  ]);

  return {
    items: topics.map((topic) => ({
      ...toTopic(topic),
      entries: topic.diaries.map((diary) => ({
        id: diary.id,
        title: diary.title,
        author: toPublicUser(diary.author),
        isMine: diary.authorId === userId,
      })),
    })),
    page,
    limit,
    total,
    hasMore: page * limit < total,
  };
}
