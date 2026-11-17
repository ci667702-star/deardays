import { z } from 'zod';
import { TOPIC_BULK_MAX, TOPIC_MAX_LENGTH } from '../config/constants.js';
import { isValidDateString } from '../utils/date.js';
import { idSchema, requiredText } from './common.js';

const topicDateSchema = z
  .string({ error: '날짜를 골라 주세요.' })
  .trim()
  .refine(isValidDateString, '날짜 형식이 올바르지 않아요. (예: 2026-11-18)')
  .refine((value) => value >= '2000-01-01' && value <= '2100-12-31', '날짜는 2000년부터 2100년 사이로 골라 주세요.');

const pageSchema = z.coerce.number().int().min(1).max(10000).default(1);
const limitSchema = (max, fallback) => z.coerce.number().int().min(1).max(max).default(fallback);

const topicContent = requiredText('주제', TOPIC_MAX_LENGTH);

/** 공간의 지난 주제 목록 */
export const topicListQuerySchema = z.object({
  roomId: idSchema('공유 공간'),
  page: pageSchema,
  limit: limitSchema(30, 10),
});

/** 관리자 비밀번호 입력 */
export const adminUnlockSchema = z.object({
  password: z.string({ error: '관리자 비밀번호를 입력해 주세요.' }).min(1, '관리자 비밀번호를 입력해 주세요.').max(200),
});

/** 주제 하나 추가. 날짜를 비우면 오늘부터 비어 있는 첫 날짜 */
export const createTopicSchema = z.object({
  content: topicContent,
  date: z.preprocess((value) => (value === '' || value === null ? undefined : value), topicDateSchema.optional()),
});

export const updateTopicSchema = z.object({
  content: topicContent,
  date: topicDateSchema,
});

/** 여러 주제를 한꺼번에: 한 줄에 하나. 오늘부터 비어 있는 날짜에 차례로 들어간다 */
export const bulkTopicSchema = z.object({
  contents: z
    .array(z.string({ error: '주제 형식이 올바르지 않아요.' }).trim().max(TOPIC_MAX_LENGTH, `주제는 ${TOPIC_MAX_LENGTH}자 이하로 써 주세요.`), {
      error: '넣을 주제를 입력해 주세요.',
    })
    .transform((list) => list.filter(Boolean))
    .refine((list) => list.length > 0, '넣을 주제를 한 줄에 하나씩 입력해 주세요.')
    .refine((list) => list.length <= TOPIC_BULK_MAX, `한 번에 ${TOPIC_BULK_MAX}개까지 넣을 수 있어요.`),
});

export const adminTopicQuerySchema = z.object({
  // upcoming: 오늘과 앞으로, past: 지난 주제
  scope: z.enum(['upcoming', 'past'], { error: 'scope 는 upcoming 또는 past 만 가능해요.' }).default('upcoming'),
  page: pageSchema,
  limit: limitSchema(100, 50),
});
