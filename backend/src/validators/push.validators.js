import { z } from 'zod';

const base64url = z.string().trim().min(1).max(255).regex(/^[A-Za-z0-9_-]+=*$/, '알림 키 형식이 올바르지 않아요.');

/** 브라우저의 PushSubscription.toJSON() 모양 */
export const subscribeSchema = z.object({
  endpoint: z.string({ error: '알림 주소가 없어요.' }).trim().url('알림 주소가 올바르지 않아요.').max(1000).refine((url) => url.startsWith('https://'), '알림 주소는 https 여야 해요.'),
  keys: z.object({ p256dh: base64url, auth: base64url }),
});

export const unsubscribeSchema = z.object({
  endpoint: z.string().trim().min(1).max(1000),
});
