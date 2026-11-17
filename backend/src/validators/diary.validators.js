import { z } from 'zod';
import { MAX_DIARY_IMAGES } from '../config/constants.js';
import { isValidDateString, isValidMonthString } from '../utils/date.js';
import { idSchema, requiredText } from './common.js';

const diaryDateSchema = z
  .string({ error: '날짜를 선택해 주세요.' })
  .trim()
  .refine(isValidDateString, '날짜 형식이 올바르지 않아요. (예: 2026-11-17)')
  .refine((value) => {
    const year = Number(value.slice(0, 4));
    return year >= 1900 && year <= 2100;
  }, '날짜는 1900년부터 2100년 사이로 골라 주세요.');

const diaryFields = {
  title: requiredText('제목', 100),
  content: requiredText('내용', 20000),
  diaryDate: diaryDateSchema,
};

export const createDiarySchema = z.object({
  roomId: idSchema('공유 공간'),
  ...diaryFields,
});

// multipart/form-data 로 들어오므로 removeImageIds 는 JSON 문자열("[1,2]")로 받는다.
const removeImageIdsSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === '') return [];
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  z
    .array(z.number().int().positive(), { error: '삭제할 사진 정보가 올바르지 않아요.' })
    .max(MAX_DIARY_IMAGES, '삭제할 사진 정보가 올바르지 않아요.'),
);

export const updateDiarySchema = z.object({
  ...diaryFields,
  removeImageIds: removeImageIdsSchema,
});

const pageSchema = z.coerce.number().int().min(1).max(10000).default(1);
const limitSchema = z.coerce.number().int().min(1).max(50).default(10);

export const listDiaryQuerySchema = z.object({
  roomId: idSchema('공유 공간'),
  sort: z.enum(['latest', 'oldest'], { error: '정렬은 latest 또는 oldest 만 가능해요.' }).default('latest'),
  date: z.string().refine(isValidDateString, '날짜 형식이 올바르지 않아요.').optional(),
  month: z.string().refine(isValidMonthString, '월 형식이 올바르지 않아요. (예: 2026-11)').optional(),
  authorId: idSchema('작성자').optional(),
  page: pageSchema,
  limit: limitSchema,
});

export const calendarQuerySchema = z.object({
  roomId: idSchema('공유 공간'),
  month: z
    .string({ error: '월을 지정해 주세요.' })
    .refine(isValidMonthString, '월 형식이 올바르지 않아요. (예: 2026-11)'),
});

export const commentSchema = z.object({
  content: requiredText('댓글', 500),
});
