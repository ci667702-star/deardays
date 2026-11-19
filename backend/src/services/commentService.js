import { COMMENT_FACES } from '../config/constants.js';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/HttpError.js';
import { toComment } from '../utils/serializers.js';
import { findDiaryForMember } from './diaryService.js';
import { notify } from './notificationService.js';

const COMMENT_NOT_FOUND = () => HttpError.notFound('댓글을 찾을 수 없어요. 삭제되었을 수도 있어요.', 'COMMENT_NOT_FOUND');

/**
 * 일기의 댓글과 답글을 쓴 순서대로 (한 줄 목록, 답글은 parentId 로 묶는다).
 * 지운 댓글이 답글 때문에 남아 있으면 내용 없이 '삭제됨'으로만 보낸다.
 */
export async function listComments(userId, diaryId) {
  await findDiaryForMember(diaryId, userId);
  const comments = await prisma.comment.findMany({
    where: { diaryId },
    include: { user: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
  return comments.map((comment) => toComment(comment, userId));
}

/**
 * 답글 대상 확인. 답글의 답글은 맨 위 댓글 아래에 붙인다(한 단계만).
 * 지운 댓글에는 답글을 달 수 없다.
 */
async function resolveParent(diaryId, parentId) {
  const parent = await prisma.comment.findUnique({
    where: { id: parentId },
    select: { id: true, diaryId: true, parentId: true, userId: true, deletedAt: true },
  });
  if (!parent || parent.diaryId !== diaryId) {
    throw HttpError.badRequest('답글을 달 댓글을 찾을 수 없어요. 지워졌을 수도 있어요.', 'PARENT_NOT_FOUND');
  }
  if (parent.deletedAt) {
    throw HttpError.badRequest('지워진 댓글에는 답글을 달 수 없어요.', 'PARENT_DELETED');
  }
  return { rootId: parent.parentId ?? parent.id, repliedUserId: parent.userId };
}

/** 알림에 보일 짧은 내용: 글이 없으면 '(웃김 얼굴)' 처럼 */
function commentPreview(content, face) {
  if (content) return content;
  return face ? `(${COMMENT_FACES[face]} 얼굴)` : '';
}

export async function createComment(userId, diaryId, { content, face = null, parentId = null }) {
  const diary = await findDiaryForMember(diaryId, userId);
  const reply = parentId ? await resolveParent(diaryId, parentId) : null;

  const comment = await prisma.comment.create({
    data: { diaryId, userId, content, face: face ?? null, parentId: reply?.rootId ?? null },
    include: { user: true },
  });
  const preview = commentPreview(content, face);

  // 답글이면 답글 받은 사람에게 '답글' 알림, 나머지 공간 사람들에게는 평소처럼 '댓글' 알림 (한 사람에게 두 번 가지 않게)
  const repliedTo = reply && reply.repliedUserId !== userId ? reply.repliedUserId : null;
  if (repliedTo) {
    await notify({
      roomId: diary.diaryRoomId,
      actorId: userId,
      type: 'COMMENT_REPLIED',
      diaryId,
      preview,
      recipientIds: [repliedTo],
    });
  }
  const members = await prisma.diaryRoomMember.findMany({ where: { diaryRoomId: diary.diaryRoomId }, select: { userId: true } });
  await notify({
    roomId: diary.diaryRoomId,
    actorId: userId,
    type: 'COMMENT_CREATED',
    diaryId,
    preview,
    recipientIds: members.map((member) => member.userId).filter((id) => id !== repliedTo),
  });
  return toComment(comment, userId);
}

/** 댓글이 속한 공간의 멤버인지, 그리고 작성자 본인인지 확인한다. 이미 지운 댓글은 없는 것으로 본다. */
async function findOwnComment(userId, commentId, action) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, parentId: true, face: true, deletedAt: true, diary: { select: { diaryRoomId: true } } },
  });
  if (!comment || comment.deletedAt) throw COMMENT_NOT_FOUND();

  const membership = await prisma.diaryRoomMember.findUnique({
    where: { userId_diaryRoomId: { userId, diaryRoomId: comment.diary.diaryRoomId } },
    select: { id: true },
  });
  if (!membership) throw COMMENT_NOT_FOUND();

  if (comment.userId !== userId) {
    throw HttpError.forbidden(`내가 쓴 댓글만 ${action}할 수 있어요.`, 'NOT_AUTHOR');
  }
  return comment;
}

export async function updateComment(userId, commentId, { content, face }) {
  const existing = await findOwnComment(userId, commentId, '수정');
  // face 를 안 보냈으면 지금 얼굴을 그대로 둔다
  const nextFace = face === undefined ? existing.face : face;
  if (!content && !nextFace) throw HttpError.badRequest('댓글 내용을 입력하거나 얼굴을 골라 주세요.', 'VALIDATION_ERROR');
  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { content, face: nextFace ?? null },
    include: { user: true },
  });
  return toComment(comment, userId);
}

/**
 * 댓글 지우기.
 * - 답글이 달린 댓글은 자리만 남기고 내용을 지운다 (답글이 함께 사라지지 않게)
 * - 답글을 지워서 '자리만 남은' 맨 위 댓글에 답글이 하나도 없으면 그 자리도 지운다
 */
export async function deleteComment(userId, commentId) {
  const comment = await findOwnComment(userId, commentId, '삭제');

  const replyCount = await prisma.comment.count({ where: { parentId: commentId } });
  if (replyCount > 0) {
    await prisma.comment.update({ where: { id: commentId }, data: { deletedAt: new Date(), content: '', face: null } });
  } else {
    await prisma.comment.delete({ where: { id: commentId } });
  }

  if (comment.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: comment.parentId },
      select: { deletedAt: true, _count: { select: { replies: true } } },
    });
    if (parent?.deletedAt && parent._count.replies === 0) {
      await prisma.comment.delete({ where: { id: comment.parentId } });
    }
  }
}
