import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/HttpError.js';
import { filePathToUploadUrl, removeUploadUrls } from '../utils/files.js';
import { toMe } from '../utils/serializers.js';
import { listRooms } from './roomService.js';

async function findUserOrThrow(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw HttpError.unauthorized('계정을 찾을 수 없어요. 다시 로그인해 주세요.', 'USER_NOT_FOUND');
  return user;
}

/** 마이페이지: 내 정보 + 작성 통계 + 참여 중인 공간 */
export async function getMyPage(userId) {
  const [user, diaryCount, likesReceived, commentsWritten, todosDone, rooms] = await Promise.all([
    findUserOrThrow(userId),
    prisma.diary.count({ where: { authorId: userId } }),
    prisma.like.count({ where: { diary: { authorId: userId } } }),
    prisma.comment.count({ where: { userId } }),
    prisma.todo.count({ where: { completedById: userId } }),
    listRooms(userId),
  ]);

  return {
    ...toMe(user),
    stats: { diaryCount, likesReceived, commentsWritten, todosDone, roomCount: rooms.length },
    rooms,
  };
}

export async function updateProfile(userId, { nickname, introduction }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(nickname !== undefined ? { nickname } : {}),
      ...(introduction !== undefined ? { introduction: introduction || null } : {}),
    },
  });
  return toMe(user);
}

export async function updateProfileImage(userId, file) {
  if (!file) throw HttpError.badRequest('바꿀 프로필 사진을 선택해 주세요.', 'NO_FILE');
  const previous = await findUserOrThrow(userId);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { profileImage: filePathToUploadUrl(file.path) },
  });

  if (previous.profileImage) await removeUploadUrls([previous.profileImage]);
  return toMe(user);
}

export async function removeProfileImage(userId) {
  const previous = await findUserOrThrow(userId);
  const user = await prisma.user.update({ where: { id: userId }, data: { profileImage: null } });
  if (previous.profileImage) await removeUploadUrls([previous.profileImage]);
  return toMe(user);
}
