import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// backend/ 폴더의 절대 경로 (src/config 기준 두 단계 위)
export const BACKEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// 어느 폴더에서 실행하든 항상 backend/.env 를 읽는다. (이미 설정된 환경변수가 우선)
dotenv.config({ path: path.join(BACKEND_ROOT, '.env'), quiet: true });

// Docker: DB_HOST·DB_USER·DB_PASSWORD·DB_NAME 으로 접속 주소를 만든다.
// 비밀번호에 @ : / # % 같은 특수문자가 있어도 되도록 URL 인코딩한다. (DATABASE_URL 을 직접 주면 그 값을 쓴다)
if (!process.env.DATABASE_URL && process.env.DB_HOST) {
  const { DB_HOST, DB_PORT = '3306', DB_USER = '', DB_PASSWORD = '', DB_NAME = '' } = process.env;
  const enc = encodeURIComponent;
  process.env.DATABASE_URL = `mysql://${enc(DB_USER)}:${enc(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${enc(DB_NAME)}`;
}

const REQUIRED = ['DATABASE_URL', 'JWT_SECRET'];
const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `환경변수 ${missing.join(', ')} 이(가) 비어 있습니다. backend/.env.example 을 복사해 backend/.env 를 만들어 주세요.`,
  );
}

if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
  throw new Error('운영 환경에서는 JWT_SECRET을 32자 이상의 임의 문자열로 설정해야 합니다.');
}

// 관리자 비밀번호: 이걸 화면에 입력한 계정이 '오늘의 주제'를 관리한다. 비어 있거나 8자보다 짧으면 관리자 기능을 끈다.
const adminPassword = process.env.ADMIN_PASSWORD ?? '';
if (adminPassword && adminPassword.length < 8) {
  console.warn('[DearDays] ADMIN_PASSWORD 가 8자보다 짧아서 관리자 기능을 껐어요. 8자 이상으로 정해 주세요.');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  // 화면을 열 수 있는 주소. CLIENT_ORIGIN(이 서버의 주소) + EXTRA_ORIGINS(Vercel 등 다른 곳에 올린 화면 주소)
  clientOrigins: [process.env.CLIENT_ORIGIN ?? 'http://localhost:5173', process.env.EXTRA_ORIGINS ?? '']
    .join(',')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean),
  uploadDir: path.resolve(BACKEND_ROOT, process.env.UPLOAD_DIR ?? 'uploads'),
  maxImageSizeMb: Number(process.env.MAX_IMAGE_SIZE_MB ?? 5),
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT ?? 30),
  // 앞에 있는 프록시 수 (Docker 의 nginx 하나면 1, 그 앞에 HTTPS 프록시를 하나 더 두면 2)
  // 요청 제한이 사용자 IP 를 제대로 알아보는 데 쓰인다.
  trustProxy: Math.max(0, Number.parseInt(process.env.TRUST_PROXY ?? '1', 10) || 0),
  adminPassword: adminPassword.length >= 8 ? adminPassword : null,
};
