import { z } from 'zod';
import { isValidDateString } from '../utils/date.js';
import { idSchema, requiredText } from './common.js';

export const createLetterSchema = z.object({
  roomId: idSchema('공유 공간'),
  recipientId: idSchema('받는 사람'),
  title: requiredText('제목', 60),
  content: requiredText('편지 내용', 5000),
  openAt: z
    .string({ error: '편지를 열 날짜를 골라 주세요.' })
    .trim()
    .refine(isValidDateString, '여는 날짜 형식이 올바르지 않아요. (예: 2026-12-25)'),
});

export const listLetterQuerySchema = z.object({
  roomId: idSchema('공유 공간'),
});
