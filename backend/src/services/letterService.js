import { prisma } from '../config/prisma.js';
import { LETTER_MAX_YEARS } from '../config/constants.js';
import { HttpError } from '../utils/HttpError.js';
import { addYears, fromDbDate, localTodayString, toDbDate } from '../utils/date.js';
import { toLetter } from '../utils/serializers.js';
import { markReadFor, notify } from './notificationService.js';
import { assertRoomMember } from './roomService.js';

const letterInclude = { sender: true, recipient: true };
const LETTER_NOT_FOUND = () => HttpError.notFound('편지를 찾을 수 없어요. 삭제되었을 수도 있어요.', 'LETTER_NOT_FOUND');

const todayDb = () => toDbDate(localTodayString());

function koreanDate(value) {
  const [, m, d] = value.split('-').map(Number);
  return `${m}월 ${d}일`;
}

/**
 * 받은 편지: 열 수 있는데 아직 안 연 편지 → 아직 봉인된 편지(여는 날 가까운 순) → 이미 연 편지(최근 순)
 * 보낸 편지: 최근에 보낸 순
 */
function sortReceived(letters, today) {
  const rank = (letter) => {
    const openable = letter.openAt.getTime() <= today.getTime();
    if (openable && !letter.openedAt) return 0;
    if (!openable) return 1;
    return 2;
  };
  return [...letters].sort((a, b) => {
    const diff = rank(a) - rank(b);
    if (diff) return diff;
    if (rank(a) === 1) return a.openAt - b.openAt || a.id - b.id;
    if (rank(a) === 2) return b.openedAt - a.openedAt || b.id - a.id;
    return b.openAt - a.openAt || b.id - a.id;
  });
}

export async function listLetters(userId, { roomId }) {
  await assertRoomMember(roomId, userId);
  const today = todayDb();

  const [received, sent] = await Promise.all([
    prisma.letter.findMany({ where: { diaryRoomId: roomId, recipientId: userId }, include: letterInclude }),
    // 나에게 보낸 편지는 '받은 편지'에만 보인다
    prisma.letter.findMany({
      where: { diaryRoomId: roomId, senderId: userId, NOT: { recipientId: userId } },
      include: letterInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    }),
  ]);

  const receivedItems = sortReceived(received, today).map((letter) => toLetter(letter, userId, today));
  return {
    received: receivedItems,
    sent: sent.map((letter) => toLetter(letter, userId, today)),
    counts: {
      unopened: receivedItems.filter((letter) => letter.openable && !letter.openedAt).length,
      sealed: receivedItems.filter((letter) => letter.sealed).length,
    },
  };
}

export async function createLetter(userId, { roomId, recipientId, title, content, openAt }) {
  await assertRoomMember(roomId, userId);

  const recipientMembership = await prisma.diaryRoomMember.findUnique({
    where: { userId_diaryRoomId: { userId: recipientId, diaryRoomId: roomId } },
    select: { id: true },
  });
  if (!recipientMembership) {
    throw HttpError.badRequest('받는 사람은 이 공간의 멤버(친구 또는 나) 중에서 골라 주세요.', 'INVALID_RECIPIENT');
  }

  const today = localTodayString();
  if (openAt < today) {
    throw HttpError.badRequest('편지를 열 날짜는 오늘이나 그 뒤로 골라 주세요.', 'INVALID_OPEN_DATE');
  }
  if (openAt > addYears(today, LETTER_MAX_YEARS)) {
    throw HttpError.badRequest(`편지는 ${LETTER_MAX_YEARS}년 안의 날짜로만 보낼 수 있어요.`, 'INVALID_OPEN_DATE');
  }

  const opensToday = openAt === today;
  const letter = await prisma.letter.create({
    data: {
      diaryRoomId: roomId,
      senderId: userId,
      recipientId,
      title,
      content,
      openAt: toDbDate(openAt),
      // 오늘 바로 열리는 편지는 '도착' 알림을 지금 보낸다
      arrivalNotified: opensToday,
    },
    include: letterInclude,
  });

  if (recipientId !== userId) {
    await notify({
      roomId,
      actorId: userId,
      type: opensToday ? 'LETTER_ARRIVED' : 'LETTER_SENT',
      letterId: letter.id,
      recipientIds: [recipientId],
      preview: opensToday ? title : null,
    });
  }
  return toLetter(letter, userId, todayDb());
}

/** 보낸 사람이나 받는 사람이면서, 지금도 그 공간의 멤버여야 볼 수 있다 */
async function findLetterForParticipant(letterId, userId) {
  const letter = await prisma.letter.findUnique({ where: { id: letterId }, include: letterInclude });
  if (!letter || (letter.senderId !== userId && letter.recipientId !== userId)) throw LETTER_NOT_FOUND();

  const membership = await prisma.diaryRoomMember.findUnique({
    where: { userId_diaryRoomId: { userId, diaryRoomId: letter.diaryRoomId } },
    select: { id: true },
  });
  if (!membership) throw LETTER_NOT_FOUND();
  return letter;
}

export async function getLetter(userId, letterId) {
  const letter = await findLetterForParticipant(letterId, userId);
  const today = todayDb();
  const openable = letter.openAt.getTime() <= today.getTime();

  if (letter.recipientId === userId) {
    if (!openable) {
      throw HttpError.forbidden(
        `아직 열 수 없는 편지예요. ${koreanDate(fromDbDate(letter.openAt))}에 열려요.`,
        'LETTER_SEALED',
      );
    }
    if (!letter.openedAt) {
      // 처음 열어 본 순간을 기록하고, 친구에게 '열어 봤어요' 알림
      const opened = await prisma.letter.update({
        where: { id: letterId },
        data: { openedAt: new Date() },
        include: letterInclude,
      });
      if (letter.senderId !== userId) {
        await notify({
          roomId: letter.diaryRoomId,
          actorId: userId,
          type: 'LETTER_OPENED',
          letterId,
          recipientIds: [letter.senderId],
          preview: letter.title,
        });
      }
      await markReadFor(userId, { letterId });
      return toLetter(opened, userId, today);
    }
    await markReadFor(userId, { letterId });
  }
  return toLetter(letter, userId, today);
}

/**
 * 삭제: 보낸 사람은 받는 사람이 열기 전까지 '보내기 취소' 할 수 있고,
 * 받는 사람은 열어 본 편지를 지울 수 있다.
 */
export async function deleteLetter(userId, letterId) {
  const letter = await findLetterForParticipant(letterId, userId);
  const canCancel = letter.senderId === userId && !letter.openedAt;
  const canDiscard = letter.recipientId === userId && Boolean(letter.openedAt);
  if (!canCancel && !canDiscard) {
    throw HttpError.forbidden(
      letter.senderId === userId
        ? '친구가 이미 열어 본 편지는 보내기를 취소할 수 없어요.'
        : '아직 열어 보지 않은 편지는 지울 수 없어요.',
      'LETTER_DELETE_FORBIDDEN',
    );
  }
  await prisma.letter.delete({ where: { id: letterId } });
}
