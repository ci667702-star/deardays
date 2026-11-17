import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';

const WINDOW_MS = 15 * 60 * 1000;
const tooMany = { message: '시도가 너무 많아요. 15분 뒤에 다시 시도해 주세요.', code: 'TOO_MANY_REQUESTS' };

const base = { windowMs: WINDOW_MS, standardHeaders: 'draft-8', legacyHeaders: false, message: tooMany };

/** 로그인: 실패한 시도만 센다 (비밀번호 무차별 대입 방지) */
export const loginLimiter = rateLimit({ ...base, limit: env.authRateLimit, skipSuccessfulRequests: true });

/** 회원가입: 계정 대량 생성 방지 */
export const registerLimiter = rateLimit({ ...base, limit: env.authRateLimit });

/** 이메일 중복 확인: 입력하면서 여러 번 부를 수 있으므로 넉넉하게 */
export const emailCheckLimiter = rateLimit({ ...base, limit: env.authRateLimit * 5 });
