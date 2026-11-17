import { prisma } from '../config/prisma.js';
import { MAX_DIARY_IMAGES } from '../config/constants.js';
import { HttpError } from '../utils/HttpError.js';
import { fromDbDate, monthRange, toDbDate } from '../utils/date.js';
import { filePathToUploadUrl, removeUploadUrls } from '../utils/files.js';
import { toDiary } from '../utils/serializers.js';
import { assertRoomMember } from './roomService.js';

const diaryInclude = (viewerId) => ({
  author: true,
  images: { orderBy: { id: 'asc' } },
  likes: { where: { userId: viewerId }, select: { userId: true } },
  _count: { select: { likes: true, comments: true } },
});

const DIARY_NOT_FOUND = () => HttpError.notFound('일기를 찾을 수 없어요. 삭제되었을 수도 있어요.', 'DIARY_NOT_FOUND');

/**
 * 일기를 찾고, 요청자가 그 일기가 속한 공간의 멤버인지 확인한다.
 * 멤버가 아니면 일기의 존재 자체를 숨기기 위해 404로 응답한다.
 */
export async function findDiaryForMember(diaryId, userId) {
  const diary = await prisma.diary.findUnique({
    where: { id: diaryId },
    select: { id: true, diaryRoomId: true, authorId: true },
  });
  if (!diary) throw DIARY_NOT_FOUND();

  const membership = await prisma.diaryRoomMember.findUnique({
    where: { userId_diaryRoomId: { userId, diaryRoomId: diary.diaryRoomId } },
    select: { id: true },
  });
  if (!membership) throw DIARY_NOT_FOUND();

  return diary;
}

function filesToImageCreates(files) {
  return files.map((file) => ({ imageUrl: filePathToUploadUrl(file.path) }));
}

export async function createDiary(userId, { roomId, title, content, diaryDate }, files = []) {
  await assertRoomMember(roomId, userId);

  const diary = await prisma.diary.create({
    data: {
      diaryRoomId: roomId,
      authorId: userId,
      title,
      content,
      diaryDate: toDbDate(diaryDate),
      images: { create: filesToImageCreates(files) },
    },
    include: diaryInclude(userId),
  });
  return toDiary(diary, userId);
}

export async function listDiaries(userId, { roomId, sort, date, month, authorId, page, limit }) {
  await assertRoomMember(roomId, userId);

  const where = { diaryRoomId: roomId };
  if (date) {
    where.diaryDate = toDbDate(date);
  } else if (month) {
    const { start, end } = monthRange(month);
    where.diaryDate = { gte: start, lt: end };
  }
  if (authorId) where.authorId = authorId;

  const direction = sort === 'oldest' ? 'asc' : 'desc';
  const [total, diaries] = await prisma.$transaction([
    prisma.diary.count({ where }),
    prisma.diary.findMany({
      where,
      include: diaryInclude(userId),
      orderBy: [{ diaryDate: direction }, { createdAt: direction }, { id: direction }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    items: diaries.map((diary) => toDiary(diary, userId)),
    page,
    limit,
    total,
    hasMore: page * limit < total,
    sort,
  };
}

/** 달력 표시용: 해당 월에 일기가 있는 날짜와 그날의 일기 요약 */
export async function getCalendar(userId, { roomId, month }) {
  await assertRoomMember(roomId, userId);
  const { start, end } = monthRange(month);

  const diaries = await prisma.diary.findMany({
    where: { diaryRoomId: roomId, diaryDate: { gte: start, lt: end } },
    select: { id: true, title: true, diaryDate: true, authorId: true },
    orderBy: [{ diaryDate: 'asc' }, { createdAt: 'asc' }],
  });

  const byDate = new Map();
  for (const diary of diaries) {
    const key = fromDbDate(diary.diaryDate);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push({ id: diary.id, title: diary.title, authorId: diary.authorId });
  }

  return {
    month,
    days: [...byDate.entries()].map(([date, items]) => ({ date, diaries: items })),
  };
}

export async function getDiary(userId, diaryId) {
  await findDiaryForMember(diaryId, userId);
  const diary = await prisma.diary.findUnique({ where: { id: diaryId }, include: diaryInclude(userId) });
  if (!diary) throw DIARY_NOT_FOUND();
  return toDiary(diary, userId);
}

export async function updateDiary(userId, diaryId, { title, content, diaryDate, removeImageIds }, files = []) {
  const diary = await findDiaryForMember(diaryId, userId);
  if (diary.authorId !== userId) {
    throw HttpError.forbidden('내가 쓴 일기만 수정할 수 있어요.', 'NOT_AUTHOR');
  }

  const existingImages = await prisma.diaryImage.findMany({ where: { diaryId } });
  const removeIds = new Set(removeImageIds);
  const imagesToRemove = existingImages.filter((image) => removeIds.has(image.id));

  if (existingImages.length - imagesToRemove.length + files.length > MAX_DIARY_IMAGES) {
    throw HttpError.badRequest(`사진은 일기 한 편에 최대 ${MAX_DIARY_IMAGES}장까지 첨부할 수 있어요.`, 'TOO_MANY_IMAGES');
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (imagesToRemove.length > 0) {
      await tx.diaryImage.deleteMany({
        where: { diaryId, id: { in: imagesToRemove.map((image) => image.id) } },
      });
    }
    return tx.diary.update({
      where: { id: diaryId },
      data: {
        title,
        content,
        diaryDate: toDbDate(diaryDate),
        images: { create: filesToImageCreates(files) },
      },
      include: diaryInclude(userId),
    });
  });

  await removeUploadUrls(imagesToRemove.map((image) => image.imageUrl));
  return toDiary(updated, userId);
}

export async function deleteDiary(userId, diaryId) {
  const diary = await findDiaryForMember(diaryId, userId);
  if (diary.authorId !== userId) {
    throw HttpError.forbidden('내가 쓴 일기만 삭제할 수 있어요.', 'NOT_AUTHOR');
  }

  const images = await prisma.diaryImage.findMany({ where: { diaryId }, select: { imageUrl: true } });
  await prisma.diary.delete({ where: { id: diaryId } });
  await removeUploadUrls(images.map((image) => image.imageUrl));
}
