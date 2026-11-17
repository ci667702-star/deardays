import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/HttpError.js';
import { ADMIN_DISABLED } from '../services/adminService.js';

/** requireAuth 다음에 둔다. 관리자 비밀번호로 관리자가 된 계정만 통과 */
export async function requireAdmin(req, _res, next) {
  if (!env.adminPassword) throw ADMIN_DISABLED();
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { isAdmin: true } });
  if (!user?.isAdmin) {
    throw HttpError.forbidden('관리자만 할 수 있어요. 관리자 비밀번호를 먼저 입력해 주세요.', 'NOT_ADMIN');
  }
  next();
}
