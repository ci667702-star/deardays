import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/HttpError.js';
import { toComment } from '../utils/serializers.js';
import { findDiaryForMember } from './diaryService.js';
import { notify } from './notificationService.js';

const COMMENT_NOT_FOUND = () => HttpError.notFound('댓글을 찾을 수 없어요. 삭제되었을 수도 있어요.', 'COMMENT_NOT_FOUND');

export async function listComments(userId, diaryId) {
  await findDiaryForMember(diaryId, userId);
  const comments = await prisma.comment.findMany({
    where: { diaryId },
    include: { user: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
  return comments.map((comment) => toComment(comment, userId));
}

export async function createComment(userId, diaryId, { content }) {
  const diary = await findDiaryForMember(diaryId, userId);
  const comment = await prisma.comment.create({
    data: { diaryId, userId, content },
    include: { user: true },
  });
  await notify({ roomId: diary.diaryRoomId, actorId: userId, type: 'COMMENT_CREATED', diaryId, preview: content });
  return toComment(comment, userId);
}

/** 댓글이 속한 공간의 멤버인지, 그리고 작성자 본인인지 확인한다. */
async function findOwnComment(userId, commentId, action) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, diary: { select: { diaryRoomId: true } } },
  });
  if (!comment) throw COMMENT_NOT_FOUND();

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

export async function updateComment(userId, commentId, { content }) {
  await findOwnComment(userId, commentId, '수정');
  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: { user: true },
  });
  return toComment(comment, userId);
}

export async function deleteComment(userId, commentId) {
  await findOwnComment(userId, commentId, '삭제');
  await prisma.comment.delete({ where: { id: commentId } });
}
