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
    isAdmin: Boolean(user.isAdmin),
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
    mood: diary.mood ?? null,
    weather: diary.weather ?? null,
    doodleUrl: diary.doodleUrl ?? null,
    topic: diary.topic ? toTopic(diary.topic) : null,
    createdAt: diary.createdAt,
    updatedAt: diary.updatedAt,
    author: toPublicUser(diary.author),
    images: (diary.images ?? []).map(toImage),
    stamps: (diary.stamps ?? []).map(toStamp),
    likeCount: diary._count?.likes ?? 0,
    commentCount: diary._count?.comments ?? 0,
    likedByMe: Array.isArray(diary.likes) ? diary.likes.some((like) => like.userId === viewerId) : false,
    isMine: diary.authorId === viewerId,
  };
}

export function toStamp(stamp) {
  return { id: stamp.id, kind: stamp.kind, createdAt: stamp.createdAt, user: toPublicUser(stamp.user) };
}

/** 오늘의 주제 (관리자 화면에는 만든 시각도 함께) */
export function toTopic(topic) {
  return { id: topic.id, date: fromDbDate(topic.date), content: topic.content, isAuto: Boolean(topic.isAuto) };
}

export function toTopicForAdmin(topic) {
  return {
    ...toTopic(topic),
    diaryCount: topic._count?.diaries ?? 0,
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
  };
}

/** 문의 (보낸 사람이 보는 모양) */
export function toInquiry(inquiry) {
  return {
    id: inquiry.id,
    category: inquiry.category,
    content: inquiry.content,
    status: inquiry.status,
    answer: inquiry.answer ?? null,
    answeredAt: inquiry.answeredAt ?? null,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
  };
}

/** 문의 (관리자가 보는 모양): 보낸 사람과 연락할 이메일까지 */
export function toInquiryForAdmin(inquiry) {
  return {
    ...toInquiry(inquiry),
    user: inquiry.user ? { ...toPublicUser(inquiry.user), email: inquiry.user.email } : null,
  };
}

export function toTodo(todo, viewerId) {
  return {
    id: todo.id,
    roomId: todo.diaryRoomId,
    content: todo.content,
    isDone: todo.isDone,
    dueDate: todo.dueDate ? fromDbDate(todo.dueDate) : null,
    doneAt: todo.doneAt,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
    creator: toPublicUser(todo.creator),
    assignee: toPublicUser(todo.assignee),
    completedBy: toPublicUser(todo.completedBy),
    isMine: todo.creatorId === viewerId,
  };
}

export function toNotification(notification) {
  return {
    id: notification.id,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    preview: notification.preview ?? null,
    actor: toPublicUser(notification.actor),
    room: notification.diaryRoom ? { id: notification.diaryRoom.id, name: notification.diaryRoom.name } : null,
    diary: notification.diary ? { id: notification.diary.id, title: notification.diary.title } : null,
    letter: notification.letter
      ? { id: notification.letter.id, openAt: fromDbDate(notification.letter.openAt) }
      : null,
  };
}

/**
 * 편지: 받는 사람에게는 여는 날 전까지 제목·내용을 숨긴다(sealed).
 * 보낸 사람은 친구에게 보낸 편지를 언제든 볼 수 있다. (나에게 보낸 편지는 받는 사람 규칙을 따른다)
 */
export function toLetter(letter, viewerId, todayDb) {
  const openable = letter.openAt.getTime() <= todayDb.getTime();
  const sealed = letter.recipientId === viewerId && !openable;
  return {
    id: letter.id,
    roomId: letter.diaryRoomId,
    title: sealed ? null : letter.title,
    content: sealed ? null : letter.content,
    openAt: fromDbDate(letter.openAt),
    openable,
    sealed,
    openedAt: letter.openedAt,
    createdAt: letter.createdAt,
    sender: toPublicUser(letter.sender),
    recipient: toPublicUser(letter.recipient),
    isSender: letter.senderId === viewerId,
    isRecipient: letter.recipientId === viewerId,
  };
}

/** 댓글·답글. 지운 댓글이 답글 때문에 자리만 남아 있으면 내용과 작성자를 숨긴다. */
export function toComment(comment, viewerId) {
  const isDeleted = Boolean(comment.deletedAt);
  return {
    id: comment.id,
    diaryId: comment.diaryId,
    parentId: comment.parentId ?? null,
    isDeleted,
    content: isDeleted ? '' : comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: isDeleted ? null : toPublicUser(comment.user),
    isMine: !isDeleted && comment.userId === viewerId,
  };
}
