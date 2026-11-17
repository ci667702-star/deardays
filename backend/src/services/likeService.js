import { prisma } from '../config/prisma.js';
import { findDiaryForMember } from './diaryService.js';
import { notify, removeLikeNotification } from './notificationService.js';

async function likeSummary(diaryId, liked) {
  const likeCount = await prisma.like.count({ where: { diaryId } });
  return { diaryId, liked, likeCount };
}

/** 공감은 여러 번 눌러도 한 번만 기록된다 (diaryId+userId 복합 unique). */
export async function likeDiary(userId, diaryId) {
  const diary = await findDiaryForMember(diaryId, userId);
  const existing = await prisma.like.findUnique({
    where: { diaryId_userId: { diaryId, userId } },
    select: { id: true },
  });

  if (!existing) {
    try {
      await prisma.like.create({ data: { diaryId, userId } });
      // 친구 일기에 공감했을 때만 그 친구에게 알린다
      if (diary.authorId !== userId) {
        await notify({
          roomId: diary.diaryRoomId,
          actorId: userId,
          type: 'LIKE_CREATED',
          diaryId,
          recipientIds: [diary.authorId],
        });
      }
    } catch (error) {
      if (error.code !== 'P2002') throw error; // 동시에 두 번 눌린 경우는 무시
    }
  }
  return likeSummary(diaryId, true);
}

export async function unlikeDiary(userId, diaryId) {
  await findDiaryForMember(diaryId, userId);
  await prisma.like.deleteMany({ where: { diaryId, userId } });
  await removeLikeNotification(userId, diaryId);
  return likeSummary(diaryId, false);
}
