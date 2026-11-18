import { z } from 'zod';
import { isValidInviteCodeFormat, normalizeInviteCode } from '../utils/inviteCode.js';
import { isValidDateString } from '../utils/date.js';
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

const anniversaryDateSchema = z
  .string({ error: '날짜를 골라 주세요.' })
  .trim()
  .refine(isValidDateString, '날짜 형식이 올바르지 않아요. (예: 2026-12-25)')
  .refine((value) => value >= '1900-01-01' && value <= '2100-12-31', '날짜는 1900년부터 2100년 사이로 골라 주세요.');

/** 기념일: 이름, 날짜, 해마다 반복 */
export const anniversarySchema = z.object({
  title: requiredText('기념일 이름', 40),
  date: anniversaryDateSchema,
  yearly: z.boolean({ error: '해마다 반복 여부가 올바르지 않아요.' }).default(false),
});
