import { z } from 'zod';
import { isValidInviteCodeFormat, normalizeInviteCode } from '../utils/inviteCode.js';
import { requiredText } from './common.js';

export const roomNameSchema = z.object({
  name: requiredText('공간 이름', 40),
});

export const joinRoomSchema = z.object({
  inviteCode: z
    .string({ error: '초대 코드를 입력해 주세요.' })
    .transform(normalizeInviteCode)
    .refine((code) => code.length > 0, '초대 코드를 입력해 주세요.')
    .refine(isValidInviteCodeFormat, '초대 코드는 영문 대문자와 숫자 8자리예요.'),
});

export const recapQuerySchema = z.object({
  // 비우면 올해
  year: z.coerce
    .number({ error: '연도가 올바르지 않아요.' })
    .int('연도가 올바르지 않아요.')
    .min(2000, '2000년 이후만 볼 수 있어요.')
    .max(2100, '연도가 올바르지 않아요.')
    .default(() => new Date().getFullYear()),
});
