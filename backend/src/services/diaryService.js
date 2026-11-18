import { prisma } from '../config/prisma.js';
import { MAX_DIARY_IMAGES } from '../config/constants.js';
import { HttpError } from '../utils/HttpError.js';
import { fromDbDate, localTodayString, monthRange, toDbDate } from '../utils/date.js';
import { diaryFileUrls, filePathToUploadUrl, removeUploadUrls } from '../utils/files.js';
import { toDiary } from '../utils/serializers.js';
import { markReadFor, notify } from './notificationService.js';
import { assertRoomMember } from './roomService.js';

const diaryInclude = (viewerId) => ({
  author: true,
  topic: true,
  images: { orderBy: { id: 'asc' } },
  stamps: { include: { user: true }, orderBy: { id: 'asc' } },
  likes: { where: { userId: viewerId }, select: { userId: true } },
  _count: { select: { likes: true, comments: { where: { deletedAt: null } } } },
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

/**
 * 일기에 붙일 주제를 확인한다. 아직 공개되지 않은(미래 날짜) 주제는 쓸 수 없다.
 * 이미 그 주제로 쓴 일기를 고칠 때(keepTopicId)는 그대로 둘 수 있다.
 */
async function assertTopicUsable(topicId, keepTopicId = null) {
  if (topicId === null || topicId === undefined || topicId === keepTopicId) return;
  const topic = await prisma.dailyTopic.findUnique({ where: { id: topicId }, select: { date: true } });
  if (!topic) throw HttpError.badRequest('주제를 찾을 수 없어요. 지워졌을 수도 있어요.', 'TOPIC_NOT_FOUND');
  if (fromDbDate(topic.date) > localTodayString()) {
    throw HttpError.badRequest('아직 공개되지 않은 주제예요.', 'TOPIC_NOT_OPEN');
  }
}

/** 업로드 파일 묶음: { images: 사진 배열, doodle: 낙서 파일 하나 } */
export async function createDiary(userId, { roomId, title, content, diaryDate, mood, weather, topicId }, { images = [], doodle = null } = {}) {
  await assertRoomMember(roomId, userId);
  await assertTopicUsable(topicId);

  const diary = await prisma.diary.create({
    data: {
      diaryRoomId: roomId,
      authorId: userId,
      title,
      content,
      diaryDate: toDbDate(diaryDate),
      mood,
      weather,
      topicId,
      doodleUrl: doodle ? filePathToUploadUrl(doodle.path) : null,
      images: { create: filesToImageCreates(images) },
    },
    include: diaryInclude(userId),
  });

  await notify({ roomId, actorId: userId, type: 'DIARY_CREATED', diaryId: diary.id, preview: title });
  return toDiary(diary, userId);
}

export async function listDiaries(userId, { roomId, sort, date, month, authorId, topicId, q, from, to, page, limit }) {
  await assertRoomMember(roomId, userId);

  const where = { diaryRoomId: roomId };
  if (date) {
    where.diaryDate = toDbDate(date);
  } else if (month) {
    const { start, end } = monthRange(month);
    where.diaryDate = { gte: start, lt: end };
  } else if (from || to) {
    where.diaryDate = {
      ...(from ? { gte: toDbDate(from) } : {}),
      ...(to ? { lte: toDbDate(to) } : {}),
    };
  }
  if (authorId) where.authorId = authorId;
  if (topicId) where.topicId = topicId;
  // 제목이나 내용에 낱말이 들어간 일기 (대소문자 구분 없음: utf8mb4_unicode_ci)
  // MySQL LIKE 의 와일드카드(%, _)와 이스케이프 문자(\)는 글자 그대로 찾도록 이스케이프한다.
  if (q) {
    const literal = q.replace(/[\\%_]/g, (char) => `\\${char}`);
    where.OR = [{ title: { contains: literal } }, { content: { contains: literal } }];
  }

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
    select: { id: true, title: true, diaryDate: true, authorId: true, mood: true },
    orderBy: [{ diaryDate: 'asc' }, { createdAt: 'asc' }],
  });

  const byDate = new Map();
  for (const diary of diaries) {
    const key = fromDbDate(diary.diaryDate);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push({ id: diary.id, title: diary.title, authorId: diary.authorId, mood: diary.mood ?? null });
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
  // 일기를 직접 열어 봤으니 이 일기에 관한 새 소식은 읽은 것으로
  await markReadFor(userId, { diaryId });
  return toDiary(diary, userId);
}

export async function updateDiary(
  userId,
  diaryId,
  { title, content, diaryDate, mood, weather, topicId, removeImageIds, removeDoodle },
  { images: files = [], doodle = null } = {},
) {
  const diary = await findDiaryForMember(diaryId, userId);
  if (diary.authorId !== userId) {
    throw HttpError.forbidden('내가 쓴 일기만 수정할 수 있어요.', 'NOT_AUTHOR');
  }
  const current = await prisma.diary.findUnique({ where: { id: diaryId }, select: { topicId: true, doodleUrl: true } });
  await assertTopicUsable(topicId, current.topicId);

  const existingImages = await prisma.diaryImage.findMany({ where: { diaryId } });
  const removeIds = new Set(removeImageIds);
  const imagesToRemove = existingImages.filter((image) => removeIds.has(image.id));

  if (existingImages.length - imagesToRemove.length + files.length > MAX_DIARY_IMAGES) {
    throw HttpError.badRequest(`사진은 일기 한 편에 최대 ${MAX_DIARY_IMAGES}장까지 첨부할 수 있어요.`, 'TOO_MANY_IMAGES');
  }

  // 새 낙서를 보내면 바꾸고, 빼기만 하면 비운다. 둘 다 아니면 그대로.
  let doodleUrl = current.doodleUrl;
  if (doodle) doodleUrl = filePathToUploadUrl(doodle.path);
  else if (removeDoodle) doodleUrl = null;
  const oldDoodleToRemove = current.doodleUrl && current.doodleUrl !== doodleUrl ? current.doodleUrl : null;

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
        mood,
        weather,
        topicId,
        doodleUrl,
        images: { create: filesToImageCreates(files) },
      },
      include: diaryInclude(userId),
    });
  });

  await removeUploadUrls([...imagesToRemove.map((image) => image.imageUrl), oldDoodleToRemove].filter(Boolean));
  return toDiary(updated, userId);
}

export async function deleteDiary(userId, diaryId) {
  const diary = await findDiaryForMember(diaryId, userId);
  if (diary.authorId !== userId) {
    throw HttpError.forbidden('내가 쓴 일기만 삭제할 수 있어요.', 'NOT_AUTHOR');
  }

  const files = await diaryFileUrls({ id: diaryId });
  await prisma.diary.delete({ where: { id: diaryId } });
  await removeUploadUrls(files);
}
