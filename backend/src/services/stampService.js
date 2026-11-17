import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/HttpError.js';
import { toStamp } from '../utils/serializers.js';
import { findDiaryForMember } from './diaryService.js';
import { notify, removeStampNotification } from './notificationService.js';

/** 알림에 보여 줄 도장 글자 (화면의 frontend/src/utils/stamps.js 와 같은 이름) */
export const STAMP_LABELS = {
  great: '참 잘했어요',
  wow: '대박',
  lol: 'ㅋㅋㅋ',
  pat: '토닥토닥',
  same: '나도 나도',
  best: '최고',
};

async function stampSummary(diaryId) {
  const stamps = await prisma.stamp.findMany({
    where: { diaryId },
    include: { user: true },
    orderBy: { id: 'asc' },
  });
  return { diaryId, stamps: stamps.map(toStamp) };
}

/**
 * 친구 일기에 도장을 찍는다. 내 일기에는 찍을 수 없고, 같은 도장은 한 번만 (여러 번 눌러도 그대로).
 */
export async function addStamp(userId, diaryId, kind) {
  const diary = await findDiaryForMember(diaryId, userId);
  if (diary.authorId === userId) {
    throw HttpError.badRequest('도장은 친구 일기에만 찍을 수 있어요.', 'OWN_DIARY');
  }

  try {
    await prisma.stamp.create({ data: { diaryId, userId, kind } });
    await notify({
      roomId: diary.diaryRoomId,
      actorId: userId,
      type: 'STAMP_CREATED',
      diaryId,
      preview: STAMP_LABELS[kind],
      recipientIds: [diary.authorId],
    });
  } catch (error) {
    if (error.code !== 'P2002') throw error; // 이미 찍은 도장
  }
  return stampSummary(diaryId);
}

/** 내가 찍은 도장을 뗀다. 그 도장 알림도 함께 지운다. */
export async function removeStamp(userId, diaryId, kind) {
  await findDiaryForMember(diaryId, userId);
  await prisma.stamp.deleteMany({ where: { diaryId, userId, kind } });
  await removeStampNotification(userId, diaryId, STAMP_LABELS[kind]);
  return stampSummary(diaryId);
}
