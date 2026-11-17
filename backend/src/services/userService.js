import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { BCRYPT_ROUNDS } from '../config/constants.js';
import { HttpError } from '../utils/HttpError.js';
import { diaryFileUrls, filePathToUploadUrl, removeUploadUrls } from '../utils/files.js';
import { signAccessToken } from '../utils/jwt.js';
import { toMe } from '../utils/serializers.js';
import { leaveRoom, listRooms } from './roomService.js';

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

/** 비밀번호를 확인한다. 틀리면 400 (401 이면 화면이 로그아웃 처리하므로 쓰지 않는다) */
async function assertPassword(user, password) {
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw HttpError.badRequest('지금 비밀번호가 맞지 않아요.', 'WRONG_PASSWORD');
}

/**
 * 비밀번호 변경. 이전에 발급된 로그인 토큰(다른 기기 포함)은 모두 무효가 되고,
 * 지금 기기에서 계속 쓰도록 새 토큰을 돌려준다.
 */
export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await findUserOrThrow(userId);
  await assertPassword(user, currentPassword);
  if (await bcrypt.compare(newPassword, user.password)) {
    throw HttpError.badRequest('지금과 다른 비밀번호로 정해 주세요.', 'SAME_PASSWORD');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { password: await bcrypt.hash(newPassword, BCRYPT_ROUNDS), passwordChangedAt: new Date() },
  });
  return { token: signAccessToken(userId) };
}

/**
 * 회원 탈퇴.
 * - 참여한 공간에서 모두 나간다 (혼자 남은 공간은 공간째 삭제, 친구가 있으면 공간은 친구에게 남음)
 * - 내가 쓴 일기·사진·댓글·공감·할 일·편지·알림을 지운다. 친구가 쓴 일기는 남는다.
 */
export async function deleteAccount(userId, { password }) {
  const user = await findUserOrThrow(userId);
  await assertPassword(user, password);

  const memberships = await prisma.diaryRoomMember.findMany({ where: { userId }, select: { diaryRoomId: true } });
  for (const { diaryRoomId } of memberships) {
    await leaveRoom(diaryRoomId, userId);
  }

  // 친구가 남아 있는 공간에 있던 내 일기의 사진·낙서 파일
  const fileUrls = await diaryFileUrls({ authorId: userId });
  await prisma.user.delete({ where: { id: userId } });

  await removeUploadUrls([...fileUrls, user.profileImage].filter(Boolean));
}

export async function removeProfileImage(userId) {
  const previous = await findUserOrThrow(userId);
  const user = await prisma.user.update({ where: { id: userId }, data: { profileImage: null } });
  if (previous.profileImage) await removeUploadUrls([previous.profileImage]);
  return toMe(user);
}
