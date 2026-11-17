import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

// 쿼리 오류는 errorHandler 와 서버 시작 시 DB 확인이 알기 쉬운 문구로 기록하므로
// Prisma 자체 오류 로그는 끄고 경고만 남긴다.
export const prisma = new PrismaClient({
  log: ['warn'],
});
