import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/HttpError.js';
import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Authorization: Bearer <token> 헤더를 검사하고 req.user 에 { id } 를 넣는다.
 * - 사용자가 사라졌거나(탈퇴)
 * - 비밀번호를 바꾸기 전에 발급된 토큰이면 401
 */
export async function requireAuth(req, _res, next) {
  const header = req.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw HttpError.unauthorized('로그인이 필요해요.', 'NO_TOKEN');
  }

  const verified = verifyAccessToken(token);
  if (!verified) {
    throw HttpError.unauthorized('로그인이 만료되었어요. 다시 로그인해 주세요.', 'INVALID_TOKEN');
  }

  const user = await prisma.user.findUnique({
    where: { id: verified.userId },
    select: { id: true, passwordChangedAt: true },
  });
  if (!user) {
    throw HttpError.unauthorized('계정을 찾을 수 없어요. 다시 로그인해 주세요.', 'USER_NOT_FOUND');
  }

  // 토큰 발급 시각(초 단위)이 비밀번호 변경 시각보다 앞서면 무효
  if (user.passwordChangedAt && verified.issuedAt < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
    throw HttpError.unauthorized('비밀번호가 바뀌어서 다시 로그인해야 해요.', 'TOKEN_REVOKED');
  }

  req.user = { id: user.id };
  next();
}
