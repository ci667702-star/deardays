import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/HttpError.js';
import { localTodayString, toDbDate } from '../utils/date.js';
import { toPublicUser, toTopic } from '../utils/serializers.js';
import { assertRoomMember } from './roomService.js';

const TOPIC_NOT_FOUND = () => HttpError.notFound('주제를 찾을 수 없어요.', 'TOPIC_NOT_FOUND');

/** 오늘의 주제 (없으면 null) */
export async function getTodayTopic() {
  const today = localTodayString();
  const topic = await prisma.dailyTopic.findUnique({ where: { date: toDbDate(today) } });
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
