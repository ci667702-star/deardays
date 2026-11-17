import { LETTERBOX_PALETTE } from '../components/layout/navItems.js';
import { parseDateString } from './date.js';

const monthDay = (value) => {
  if (!value) return '';
  const { monthIndex, day } = parseDateString(value);
  return `${monthIndex + 1}월 ${day}일`;
};

/**
 * 알림 한 건을 화면에 보여 줄 문구·아이콘·이동할 곳으로 바꾼다.
 * @returns {{ icon, palette?, text, detail?, to, roomId }}
 */
export function describeNotification(notification, meId) {
  const { type, actor, diary, letter, room, preview } = notification;
  const who = actor ? `${actor.nickname}님이` : '누군가';
  const diaryTitle = diary?.title ?? preview ?? '일기';
  const roomId = room?.id ?? null;

  switch (type) {
    case 'DIARY_CREATED':
      return { icon: 'letter', text: `${who} 새 일기를 썼어요`, detail: diaryTitle, to: diary ? `/diaries/${diary.id}` : '/room', roomId };
    case 'COMMENT_CREATED':
      return {
        icon: 'letter',
        text: `${who} '${diaryTitle}'에 댓글을 남겼어요`,
        detail: preview,
        to: diary ? `/diaries/${diary.id}` : '/room',
        roomId,
      };
    case 'LIKE_CREATED':
      return { icon: 'heart', text: `${who} '${diaryTitle}'에 공감했어요`, to: diary ? `/diaries/${diary.id}` : '/room', roomId };
    case 'STAMP_CREATED':
      return {
        icon: 'stamp',
        text: `${who} '${diaryTitle}'에 도장을 찍었어요`,
        detail: preview ? `[${preview}]` : null,
        to: diary ? `/diaries/${diary.id}` : '/room',
        roomId,
      };
    case 'TODO_ASSIGNED':
      return { icon: 'checklist', text: `${who} 할 일을 맡겼어요`, detail: preview, to: '/todos', roomId };
    case 'MEMBER_JOINED':
      return { icon: 'book', text: `${who} '${room?.name ?? '공유 공간'}'에 들어왔어요`, to: '/room', roomId };
    case 'LETTER_SENT':
      return {
        icon: 'letter',
        palette: LETTERBOX_PALETTE,
        text: `${who} 타임캡슐 편지를 보냈어요`,
        detail: letter ? `${monthDay(letter.openAt)}에 열 수 있어요` : null,
        to: '/letters',
        roomId,
      };
    case 'LETTER_ARRIVED':
      return {
        icon: 'letter',
        palette: LETTERBOX_PALETTE,
        text: actor?.id === meId ? '내가 나에게 쓴 편지가 도착했어요' : `${actor ? `${actor.nickname}님의` : ''} 편지가 도착했어요`.trim(),
        detail: preview ? `'${preview}' 지금 열어 볼 수 있어요` : '지금 열어 볼 수 있어요',
        to: letter ? `/letters?open=${letter.id}` : '/letters',
        roomId,
      };
    case 'LETTER_OPENED':
      return {
        icon: 'letter',
        palette: LETTERBOX_PALETTE,
        text: `${who} 내 편지를 열어 봤어요`,
        detail: preview,
        to: '/letters?tab=sent',
        roomId,
      };
    default:
      return { icon: 'bell', text: '새 소식이 있어요', to: '/', roomId };
  }
}
