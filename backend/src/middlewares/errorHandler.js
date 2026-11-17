import multer from 'multer';
import { Prisma } from '@prisma/client';
import { env } from '../config/env.js';
import { MAX_DIARY_IMAGES } from '../config/constants.js';
import { HttpError } from '../utils/HttpError.js';
import { collectRequestFiles, removeFiles } from '../utils/files.js';

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: `사진 한 장은 ${env.maxImageSizeMb}MB 이하만 올릴 수 있어요.`,
  LIMIT_FILE_COUNT: `사진은 최대 ${MAX_DIARY_IMAGES}장까지 올릴 수 있어요.`,
  LIMIT_UNEXPECTED_FILE: `사진은 최대 ${MAX_DIARY_IMAGES}장까지, 정해진 항목으로만 올릴 수 있어요.`,
  LIMIT_FIELD_COUNT: '입력 항목이 너무 많아요.',
  LIMIT_PART_COUNT: '입력 항목이 너무 많아요.',
};

export function notFoundHandler(req, _res, next) {
  next(HttpError.notFound(`요청한 API(${req.method} ${req.originalUrl})를 찾을 수 없어요.`));
}

// eslint-disable-next-line no-unused-vars
export async function errorHandler(err, req, res, _next) {
  // 실패한 요청에서 이미 저장된 업로드 파일은 지운다.
  await removeFiles(collectRequestFiles(req).map((file) => file.path));

  let status = 500;
  let body = { message: '서버에서 문제가 생겼어요. 잠시 후 다시 시도해 주세요.', code: 'INTERNAL_ERROR' };

  if (err instanceof HttpError) {
    status = err.status;
    body = { message: err.message, code: err.code };
  } else if (err instanceof multer.MulterError) {
    status = 400;
    body = { message: MULTER_MESSAGES[err.code] ?? '파일 업로드에 실패했어요.', code: err.code };
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    body = { message: '요청 형식(JSON)이 올바르지 않아요.', code: 'INVALID_JSON' };
  } else if (err?.type === 'entity.too.large') {
    status = 413;
    body = { message: '요청 내용이 너무 커요.', code: 'PAYLOAD_TOO_LARGE' };
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      status = 409;
      body = { message: '이미 존재하는 데이터예요.', code: 'DUPLICATE' };
    } else if (err.code === 'P2025') {
      status = 404;
      body = { message: '요청한 내용을 찾을 수 없어요.', code: 'NOT_FOUND' };
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    status = 503;
    body = { message: '데이터베이스에 연결할 수 없어요. 서버 설정을 확인해 주세요.', code: 'DB_UNAVAILABLE' };
  }

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  res.status(status).json(body);
}
