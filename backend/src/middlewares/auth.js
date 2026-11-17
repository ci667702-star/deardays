import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/HttpError.js';
import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Authorization: Bearer <token> 헤더를 검사하고 req.user 에 { id } 를 넣는다.
 * 토큰이 유효해도 탈퇴 등으로 사용자가 사라졌다면 401로 응답한다.
 */
export async function requireAuth(req, _res, next) {
  const header = req.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw HttpError.unauthorized('로그인이 필요해요.', 'NO_TOKEN');
  }

  const userId = verifyAccessToken(token);
  if (!userId) {
    throw HttpError.unauthorized('로그인이 만료되었어요. 다시 로그인해 주세요.', 'INVALID_TOKEN');
  }

  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!exists) {
    throw HttpError.unauthorized('계정을 찾을 수 없어요. 다시 로그인해 주세요.', 'USER_NOT_FOUND');
  }

  req.user = { id: userId };
  next();
}
