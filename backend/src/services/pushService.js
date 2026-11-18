import { createHash } from 'node:crypto';
import webpush from 'web-push';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/HttpError.js';

// 휴대폰·브라우저 푸시 알림 (Web Push). 서버 .env 에 VAPID 키가 있어야 켜진다 (npm run push:keys 로 만들기).
const enabled = Boolean(env.vapid.publicKey && env.vapid.privateKey);
if (enabled) {
  webpush.setVapidDetails(env.vapid.subject, env.vapid.publicKey, env.vapid.privateKey);
}

const hashOf = (endpoint) => createHash('sha256').update(endpoint).digest('hex');

export function getStatus() {
  return { enabled, publicKey: enabled ? env.vapid.publicKey : null };
}

function assertEnabled() {
  if (!enabled) {
    throw HttpError.forbidden('서버에 푸시 알림 키가 없어서 휴대폰 알림을 켤 수 없어요. (VAPID 키 설정 필요)', 'PUSH_DISABLED');
  }
}

/** 이 기기를 알림 받을 곳으로 등록 (같은 기기면 새 계정으로 옮겨 붙인다) */
export async function subscribe(userId, { endpoint, keys }, userAgent) {
  assertEnabled();
  const endpointHash = hashOf(endpoint);
  const data = { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent: userAgent?.slice(0, 255) ?? null };
  await prisma.pushSubscription.upsert({ where: { endpointHash }, update: data, create: { ...data, endpointHash } });
  return { subscribed: true };
}

export async function unsubscribe(userId, { endpoint }) {
  await prisma.pushSubscription.deleteMany({ where: { userId, endpointHash: hashOf(endpoint) } });
  return { subscribed: false };
}

export async function countMine(userId) {
  return prisma.pushSubscription.count({ where: { userId } });
}

/**
 * 사람들의 모든 기기로 보낸다. 사라진 구독(404/410)은 지운다. 실패해도 원래 작업은 막지 않는다.
 * @returns {{ sent, failed }}
 */
export async function sendToUsers(userIds, payload) {
  if (!enabled || userIds.length === 0) return { sent: 0, failed: 0 };
  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId: { in: userIds } } });
  const body = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, body, {
          TTL: 24 * 60 * 60,
          timeout: 10000,
        });
        sent += 1;
      } catch (error) {
        failed += 1;
        if (error.statusCode === 404 || error.statusCode === 410) {
          await prisma.pushSubscription.deleteMany({ where: { id: sub.id } });
        } else {
          console.warn('[push] 보내지 못했어요:', error.statusCode ?? error.code ?? error.message);
        }
      }
    }),
  );
  return { sent, failed };
}

/** 알림 종류별 휴대폰 알림 문구 (화면의 frontend/src/utils/notifications.js 와 같은 말투) */
function describe({ type, actor, diaryTitle, preview, roomName, letterId, diaryId }) {
  const who = actor ? `${actor}님이` : '누군가';
  const title = `DearDays · ${roomName}`;
  const toDiary = diaryId ? `/diaries/${diaryId}` : '/';
  switch (type) {
    case 'DIARY_CREATED':
      return { title, body: `${who} 새 일기를 썼어요: ${diaryTitle ?? preview ?? ''}`, url: toDiary };
    case 'COMMENT_CREATED':
      return { title, body: `${who} '${diaryTitle}'에 댓글: ${preview ?? ''}`, url: toDiary };
    case 'COMMENT_REPLIED':
      return { title, body: `${who} 내 댓글에 답글: ${preview ?? ''}`, url: toDiary };
    case 'LIKE_CREATED':
      return { title, body: `${who} '${diaryTitle}'에 공감했어요`, url: toDiary };
    case 'STAMP_CREATED':
      return { title, body: `${who} '${diaryTitle}'에 [${preview}] 도장을 찍었어요`, url: toDiary };
    case 'TODO_ASSIGNED':
      return { title, body: `${who} 할 일을 맡겼어요: ${preview ?? ''}`, url: '/todos' };
    case 'MEMBER_JOINED':
      return { title, body: `${who} 공간에 들어왔어요`, url: '/room' };
    case 'LETTER_SENT':
      return { title, body: `${who} 타임캡슐 편지를 보냈어요`, url: '/letters' };
    case 'LETTER_OPENED':
      return { title, body: `${who} 내 편지를 열어 봤어요`, url: letterId ? '/letters?tab=sent' : '/letters' };
    default:
      return { title, body: '새 소식이 있어요', url: '/' };
  }
}

/** notify() 가 알림을 만든 뒤 부른다: 받는 사람들의 기기로 같은 소식을 보낸다 */
export async function pushNotification({ type, roomId, actorId, diaryId, letterId, preview, recipientIds }) {
  if (!enabled || recipientIds.length === 0) return;
  const [actor, diary, room] = await Promise.all([
    actorId ? prisma.user.findUnique({ where: { id: actorId }, select: { nickname: true } }) : null,
    diaryId ? prisma.diary.findUnique({ where: { id: diaryId }, select: { title: true } }) : null,
    prisma.diaryRoom.findUnique({ where: { id: roomId }, select: { name: true } }),
  ]);
  const message = describe({
    type,
    actor: actor?.nickname,
    diaryTitle: diary?.title,
    preview,
    roomName: room?.name ?? '',
    letterId,
    diaryId,
  });
  await sendToUsers(recipientIds, { ...message, tag: `${type}:${diaryId ?? letterId ?? roomId}` });
}

/** 내 기기로 시험 알림 */
export async function sendTest(userId) {
  assertEnabled();
  return sendToUsers([userId], {
    title: 'DearDays',
    body: '알림이 잘 와요! 친구가 일기나 댓글을 쓰면 이렇게 알려 줄게요.',
    url: '/me',
    tag: 'test',
  });
}
