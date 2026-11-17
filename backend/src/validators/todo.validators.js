import { z } from 'zod';
import { isValidDateString } from '../utils/date.js';
import { idSchema, requiredText } from './common.js';

// 빈 문자열·미입력은 '없음(null)'으로 본다.
const emptyToNull = (value) => (value === '' || value === undefined ? null : value);

const dueDateSchema = z.preprocess(
  emptyToNull,
  z.union(
    [
      z.null(),
      z
        .string()
        .refine(isValidDateString, '기한 날짜 형식이 올바르지 않아요. (예: 2026-11-21)')
        .refine((value) => {
          const year = Number(value.slice(0, 4));
          return year >= 1900 && year <= 2100;
        }, '기한은 1900년부터 2100년 사이로 골라 주세요.'),
    ],
    { error: '기한 날짜 형식이 올바르지 않아요. (예: 2026-11-21)' },
  ),
);

// 맡은 사람: 비우면 '함께'
const assigneeSchema = z.preprocess(
  emptyToNull,
  z.union([z.null(), z.coerce.number().int().positive()], { error: '맡을 사람 정보가 올바르지 않아요.' }),
);

const todoFields = {
  content: requiredText('할 일', 200),
  dueDate: dueDateSchema,
  assigneeId: assigneeSchema,
};

export const createTodoSchema = z.object({
  roomId: idSchema('공유 공간'),
  ...todoFields,
});

/** 수정은 내용·기한·맡은 사람을 한 번에 바꾼다 (보내지 않은 기한·맡은 사람은 비움) */
export const updateTodoSchema = z.object(todoFields);

export const todoStatusSchema = z.object({
  isDone: z.boolean({ error: '완료 여부(isDone)는 true 또는 false 로 보내 주세요.' }),
});

export const listTodoQuerySchema = z.object({
  roomId: idSchema('공유 공간'),
});
