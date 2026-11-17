import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { BCRYPT_ROUNDS } from '../config/constants.js';
import { HttpError } from '../utils/HttpError.js';
import { signAccessToken } from '../utils/jwt.js';
import { toMe } from '../utils/serializers.js';

// 없는 이메일로 로그인할 때도 비교 시간을 비슷하게 맞춰 계정 존재 여부가 드러나지 않게 한다.
let dummyHashPromise;
function getDummyHash() {
  dummyHashPromise ??= bcrypt.hash('deardays-timing-guard', BCRYPT_ROUNDS);
  return dummyHashPromise;
}

export async function isEmailAvailable(email) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return !user;
}

export async function register({ email, nickname, password }) {
  if (!(await isEmailAvailable(email))) {
    throw HttpError.conflict('이미 가입된 이메일이에요. 로그인하거나 다른 이메일을 써 주세요.', 'EMAIL_TAKEN');
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: { email, nickname, password: hashedPassword },
    });
    return { token: signAccessToken(user.id), user: toMe(user) };
  } catch (error) {
    // 동시에 같은 이메일로 가입한 경우
    if (error.code === 'P2002') {
      throw HttpError.conflict('이미 가입된 이메일이에요. 로그인하거나 다른 이메일을 써 주세요.', 'EMAIL_TAKEN');
    }
    throw error;
  }
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = await bcrypt.compare(password, user?.password ?? (await getDummyHash()));

  if (!user || !passwordMatches) {
    throw HttpError.unauthorized('이메일 또는 비밀번호가 올바르지 않아요.', 'INVALID_CREDENTIALS');
  }

  return { token: signAccessToken(user.id), user: toMe(user) };
}

export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw HttpError.unauthorized('계정을 찾을 수 없어요. 다시 로그인해 주세요.', 'USER_NOT_FOUND');
  return toMe(user);
}
