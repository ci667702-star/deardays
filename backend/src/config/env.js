import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// backend/ 폴더의 절대 경로 (src/config 기준 두 단계 위)
export const BACKEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

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

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientOrigins: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  uploadDir: path.resolve(BACKEND_ROOT, process.env.UPLOAD_DIR ?? 'uploads'),
  maxImageSizeMb: Number(process.env.MAX_IMAGE_SIZE_MB ?? 5),
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT ?? 30),
};
