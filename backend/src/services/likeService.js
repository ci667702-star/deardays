import { prisma } from '../config/prisma.js';
import { findDiaryForMember } from './diaryService.js';

async function likeSummary(diaryId, liked) {
  const likeCount = await prisma.like.count({ where: { diaryId } });
  return { diaryId, liked, likeCount };
}

/** 공감은 여러 번 눌러도 한 번만 기록된다 (diaryId+userId 복합 unique). */
export async function likeDiary(userId, diaryId) {
  await findDiaryForMember(diaryId, userId);
  await prisma.like.upsert({
    where: { diaryId_userId: { diaryId, userId } },
    create: { diaryId, userId },
    update: {},
  });
  return likeSummary(diaryId, true);
}

export async function unlikeDiary(userId, diaryId) {
  await findDiaryForMember(diaryId, userId);
  await prisma.like.deleteMany({ where: { diaryId, userId } });
  return likeSummary(diaryId, false);
}
