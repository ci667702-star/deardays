import { fromDbDate } from './date.js';

/** 다른 사용자에게 보여 줘도 되는 프로필 정보 */
export function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    nickname: user.nickname,
    profileImage: user.profileImage ?? null,
    introduction: user.introduction ?? '',
  };
}

/** 본인에게만 보여 주는 계정 정보 (비밀번호 제외) */
export function toMe(user) {
  return {
    ...toPublicUser(user),
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toRoom(room, { includeInviteCode = true } = {}) {
  return {
    id: room.id,
    name: room.name,
    ...(includeInviteCode ? { inviteCode: room.inviteCode } : {}),
    createdAt: room.createdAt,
    members: (room.members ?? []).map((member) => ({
      ...toPublicUser(member.user),
      joinedAt: member.joinedAt,
    })),
    diaryCount: room._count?.diaries ?? 0,
  };
}

export function toImage(image) {
  return { id: image.id, imageUrl: image.imageUrl, createdAt: image.createdAt };
}

export function toDiary(diary, viewerId) {
  return {
    id: diary.id,
    roomId: diary.diaryRoomId,
    title: diary.title,
    content: diary.content,
    diaryDate: fromDbDate(diary.diaryDate),
    createdAt: diary.createdAt,
    updatedAt: diary.updatedAt,
    author: toPublicUser(diary.author),
    images: (diary.images ?? []).map(toImage),
    likeCount: diary._count?.likes ?? 0,
    commentCount: diary._count?.comments ?? 0,
    likedByMe: Array.isArray(diary.likes) ? diary.likes.some((like) => like.userId === viewerId) : false,
    isMine: diary.authorId === viewerId,
  };
}

export function toComment(comment, viewerId) {
  return {
    id: comment.id,
    diaryId: comment.diaryId,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: toPublicUser(comment.user),
    isMine: comment.userId === viewerId,
  };
}
