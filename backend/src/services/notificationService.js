import { prisma } from '../config/prisma.js';
import { NOTIFICATION_LIST_LIMIT } from '../config/constants.js';
import { HttpError } from '../utils/HttpError.js';
import { localTodayString, toDbDate } from '../utils/date.js';
import { toNotification } from '../utils/serializers.js';

const clip = (text, max = 120) => {
  if (!text) return null;
  const oneLine = String(text).replace(/\s+/g, ' ').trim();
  return oneLine.length > max ? `${oneLine.slice(0, max - 1)}…` : oneLine;
};

/**
 * 알림 만들기. recipientIds 가 없으면 공간의 다른 멤버 모두에게 보낸다.
 * 행동한 사람(actor)에게는 보내지 않는다. 알림 실패가 원래 작업을 막지 않도록 오류는 기록만 한다.
 */
export async function notify({ roomId, actorId, type, diaryId = null, letterId = null, preview = null, recipientIds }) {
  try {
    let recipients = recipientIds;
    if (!recipients) {
      const members = await prisma.diaryRoomMember.findMany({
        where: { diaryRoomId: roomId },
        select: { userId: true },
      });
      recipients = members.map((member) => member.userId);
    }
    const targets = [...new Set(recipients)].filter((id) => id && id !== actorId);
    if (targets.length === 0) return;

    await prisma.notification.createMany({
      data: targets.map((recipientId) => ({
        recipientId,
        actorId,
        diaryRoomId: roomId,
        type,
        diaryId,
        letterId,
        preview: clip(preview),
      })),
    });
  } catch (error) {
    console.warn(`[notify] ${type} 알림을 만들지 못했어요:`, error.message);
  }
}

/**
 * 여는 날이 된 타임캡슐 편지를 '도착' 알림으로 바꾼다.
 * 예약 작업 없이, 받는 사람이 새 소식을 확인할 때 한 번만 만든다.
 */
async function syncLetterArrivals(userId) {
  const today = toDbDate(localTodayString());
  const due = await prisma.letter.findMany({
    where: {
      recipientId: userId,
      arrivalNotified: false,
      openAt: { lte: today },
      diaryRoom: { members: { some: { userId } } },
    },
    select: { id: true, diaryRoomId: true, senderId: true, title: true },
  });

  for (const letter of due) {
    // 동시에 두 번 불려도 한 번만 알리도록, 표시를 먼저 바꾼 쪽만 알림을 만든다.
    const { count } = await prisma.letter.updateMany({
      where: { id: letter.id, arrivalNotified: false },
      data: { arrivalNotified: true },
    });
    if (count === 1) {
      await prisma.notification.create({
        data: {
          recipientId: userId,
          actorId: letter.senderId,
          diaryRoomId: letter.diaryRoomId,
          type: 'LETTER_ARRIVED',
          letterId: letter.id,
          preview: clip(letter.title),
        },
      });
    }
  }
}

// 지금 참여하고 있는 공간의 알림만 보여 준다.
const visibleWhere = (userId, extra = {}) => ({
  recipientId: userId,
  diaryRoom: { members: { some: { userId } } },
  ...extra,
});

export async function getUnreadCount(userId) {
  await syncLetterArrivals(userId);
  return prisma.notification.count({ where: visibleWhere(userId, { isRead: false }) });
}

export async function listNotifications(userId) {
  await syncLetterArrivals(userId);
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: visibleWhere(userId),
      include: {
        actor: true,
        diaryRoom: { select: { id: true, name: true } },
        diary: { select: { id: true, title: true } },
        letter: { select: { id: true, openAt: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: NOTIFICATION_LIST_LIMIT,
    }),
    prisma.notification.count({ where: visibleWhere(userId, { isRead: false }) }),
  ]);
  return { items: items.map(toNotification), unreadCount };
}

export async function markRead(userId, notificationId) {
  const { count } = await prisma.notification.updateMany({
    where: { id: notificationId, recipientId: userId },
    data: { isRead: true },
  });
  if (count === 0) throw HttpError.notFound('알림을 찾을 수 없어요.', 'NOTIFICATION_NOT_FOUND');
}

export async function markAllRead(userId) {
  await prisma.notification.updateMany({ where: { recipientId: userId, isRead: false }, data: { isRead: true } });
}

/** 일기·편지를 직접 열어 봤다면 그에 관한 알림은 읽은 것으로 */
export async function markReadFor(userId, { diaryId, letterId }) {
  await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false, ...(diaryId ? { diaryId } : {}), ...(letterId ? { letterId } : {}) },
    data: { isRead: true },
  });
}

/** 공감을 취소하면 그 공감 알림도 지운다 (눌렀다 뗐다 해도 알림이 쌓이지 않게) */
export async function removeLikeNotification(actorId, diaryId) {
  await prisma.notification.deleteMany({ where: { type: 'LIKE_CREATED', actorId, diaryId } });
}

/** 도장을 떼면 그 도장 알림도 지운다 */
export async function removeStampNotification(actorId, diaryId, preview) {
  await prisma.notification.deleteMany({ where: { type: 'STAMP_CREATED', actorId, diaryId, preview } });
}
