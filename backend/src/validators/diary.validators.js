import { z } from 'zod';
import { COMMENT_FACES, MAX_DIARY_IMAGES, MOODS, STAMP_KINDS, WEATHERS } from '../config/constants.js';
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

// 기분·날씨는 선택. 비우거나 보내지 않으면 없음(null)
const emptyToNull = (value) => (value === '' || value === undefined ? null : value);
const pickOne = (values, label) =>
  z.preprocess(emptyToNull, z.union([z.null(), z.enum(values)], { error: `${label} 값이 올바르지 않아요.` }));

// 오늘의 주제로 쓴 일기면 주제 번호. 비우면 주제 없음(null)
const topicIdSchema = z.preprocess(
  (value) => (value === '' || value === undefined || value === 'null' ? null : value),
  z.union([z.null(), idSchema('주제')]),
);

const diaryFields = {
  title: requiredText('제목', 100),
  content: requiredText('내용', 20000),
  diaryDate: diaryDateSchema,
  mood: pickOne(MOODS, '기분'),
  weather: pickOne(WEATHERS, '날씨'),
  topicId: topicIdSchema,
};

// multipart/form-data 의 참/거짓 값 ("true" / "false")
const formBoolean = z.preprocess(
  (value) => value === true || value === 'true' || value === '1',
  z.boolean(),
);

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
  // 낙서 그림 빼기 (새 낙서를 함께 보내면 새 그림으로 바뀐다)
  removeDoodle: formBoolean,
});

const pageSchema = z.coerce.number().int().min(1).max(10000).default(1);
const limitSchema = z.coerce.number().int().min(1).max(50).default(10);

const optionalDate = (label) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().refine(isValidDateString, `${label} 날짜 형식이 올바르지 않아요.`).optional(),
  );

export const listDiaryQuerySchema = z
  .object({
    roomId: idSchema('공유 공간'),
    sort: z.enum(['latest', 'oldest'], { error: '정렬은 latest 또는 oldest 만 가능해요.' }).default('latest'),
    date: z.string().refine(isValidDateString, '날짜 형식이 올바르지 않아요.').optional(),
    month: z.string().refine(isValidMonthString, '월 형식이 올바르지 않아요. (예: 2026-11)').optional(),
    authorId: z.preprocess((value) => (value === '' ? undefined : value), idSchema('작성자').optional()),
    topicId: z.preprocess((value) => (value === '' ? undefined : value), idSchema('주제').optional()),
    // 검색: 제목·내용 낱말, 날짜 범위
    q: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
      z.string().trim().max(50, '찾을 낱말은 50자 이하로 써 주세요.').optional(),
    ),
    from: optionalDate('시작'),
    to: optionalDate('끝'),
    page: pageSchema,
    limit: limitSchema,
  })
  .refine((query) => !query.from || !query.to || query.from <= query.to, {
    message: '시작 날짜가 끝 날짜보다 늦어요.',
  });

export const calendarQuerySchema = z.object({
  roomId: idSchema('공유 공간'),
  month: z
    .string({ error: '월을 지정해 주세요.' })
    .refine(isValidMonthString, '월 형식이 올바르지 않아요. (예: 2026-11)'),
});

const commentText = z
  .string({ error: '댓글 형식이 올바르지 않아요.' })
  .trim()
  .max(500, '댓글은 500자 이하로 써 주세요.')
  .default('');

/** 얼굴 이모티콘: 빼면 그대로(수정할 때), null 이면 없앰 */
const commentFace = z
  .enum(Object.keys(COMMENT_FACES), { error: '얼굴 이모티콘이 올바르지 않아요.' })
  .nullable()
  .optional();

const EMPTY_COMMENT = '댓글 내용을 입력하거나 얼굴을 골라 주세요.';

/** 댓글 수정. 글이 비면 얼굴이 있어야 한다 (지금 달린 얼굴은 서비스에서 확인) */
export const commentSchema = z.object({
  content: commentText,
  face: commentFace,
});

/** 새 댓글. parentId 를 주면 그 댓글에 다는 답글. 글이나 얼굴 중 하나는 있어야 한다 */
export const createCommentSchema = z
  .object({
    content: commentText,
    face: commentFace,
    parentId: z.preprocess((value) => (value === '' || value === null ? undefined : value), idSchema('답글 대상').optional()),
  })
  .refine((value) => Boolean(value.content || value.face), { message: EMPTY_COMMENT, path: ['content'] });

export const stampSchema = z.object({
  kind: z.enum(STAMP_KINDS, { error: '도장 종류가 올바르지 않아요.' }),
});

export const stampParamSchema = z.object({
  id: idSchema(),
  kind: z.enum(STAMP_KINDS, { error: '도장 종류가 올바르지 않아요.' }),
});
