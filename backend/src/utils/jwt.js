import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256',
  });
}

/** 유효하면 { userId, issuedAt(초) } 를, 아니면 null 을 돌려준다. */
export function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) return null;
    return { userId, issuedAt: payload.iat };
  } catch {
    return null;
  }
}
