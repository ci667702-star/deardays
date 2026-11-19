import { z } from 'zod';
import { INQUIRY_CATEGORIES, INQUIRY_MAX_LENGTH } from '../config/constants.js';
import { requiredText } from './common.js';

/** 문의 보내기 */
export const createInquirySchema = z.object({
  category: z.enum(INQUIRY_CATEGORIES, { error: '문의 종류를 골라 주세요.' }),
  content: requiredText('문의 내용', INQUIRY_MAX_LENGTH, { min: 5 }),
});

/** 관리자 문의함 목록 */
export const adminInquiryQuerySchema = z.object({
  // open: 확인 전, done: 처리함, all: 전부
  status: z.enum(['open', 'done', 'all'], { error: 'status 는 open, done, all 만 가능해요.' }).default('open'),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(30),
});

/**
 * 관리자 답변·처리. answer 를 빼면 답변은 그대로, 빈 문자열이면 답변을 지운다.
 * status 는 처리함(done) 또는 다시 확인 전(open).
 */
export const updateInquirySchema = z.object({
  answer: z
    .string({ error: '답변 형식이 올바르지 않아요.' })
    .trim()
    .max(INQUIRY_MAX_LENGTH, `답변은 ${INQUIRY_MAX_LENGTH}자 이하로 써 주세요.`)
    .nullable()
    .optional(),
  status: z.enum(['open', 'done'], { error: 'status 는 open 또는 done 만 가능해요.' }),
});
