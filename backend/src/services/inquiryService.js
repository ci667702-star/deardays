import { prisma } from '../config/prisma.js';
import { INQUIRY_OPEN_MAX } from '../config/constants.js';
import { HttpError } from '../utils/HttpError.js';
import { toInquiry, toInquiryForAdmin } from '../utils/serializers.js';

const NOT_FOUND = () => HttpError.notFound('문의를 찾을 수 없어요.', 'INQUIRY_NOT_FOUND');

/** 문의 보내기. 아직 처리 안 된 문의가 너무 많으면 막는다 */
export async function createInquiry(userId, { category, content }) {
  const open = await prisma.inquiry.count({ where: { userId, status: 'open' } });
  if (open >= INQUIRY_OPEN_MAX) {
    throw HttpError.conflict(
      `아직 확인 전인 문의가 ${INQUIRY_OPEN_MAX}개 있어요. 답변을 받은 뒤에 더 보내 주세요.`,
      'TOO_MANY_OPEN_INQUIRIES',
    );
  }
  const inquiry = await prisma.inquiry.create({ data: { userId, category, content } });
  return toInquiry(inquiry);
}

/** 내가 보낸 문의 (최근 것부터 50개) */
export async function listMyInquiries(userId) {
  const inquiries = await prisma.inquiry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
  return inquiries.map(toInquiry);
}

/** 내 문의 지우기 (다른 사람 문의는 없는 것처럼) */
export async function deleteMyInquiry(userId, inquiryId) {
  const { count } = await prisma.inquiry.deleteMany({ where: { id: inquiryId, userId } });
  if (count === 0) throw NOT_FOUND();
}

const withUser = { user: { select: { id: true, nickname: true, profileImage: true, introduction: true, email: true } } };

/** 관리자 문의함: 상태별 목록 + 상태별 개수 */
export async function listForAdmin({ status, page, limit }) {
  const where = status === 'all' ? {} : { status };
  const [total, inquiries, groups] = await Promise.all([
    prisma.inquiry.count({ where }),
    prisma.inquiry.findMany({
      where,
      include: withUser,
      // 확인 전은 오래 기다린 것부터, 처리한 것·전체는 최근 것부터
      orderBy: { createdAt: status === 'open' ? 'asc' : 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.inquiry.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);
  const counts = { open: 0, done: 0 };
  for (const group of groups) counts[group.status] = group._count._all;
  return { items: inquiries.map(toInquiryForAdmin), page, limit, total, hasMore: page * limit < total, status, counts };
}

/** 관리자: 답변 쓰기·고치기·지우기, 처리함 / 다시 확인 전으로 */
export async function updateForAdmin(inquiryId, { answer, status }) {
  const existing = await prisma.inquiry.findUnique({ where: { id: inquiryId }, select: { id: true, answer: true } });
  if (!existing) throw NOT_FOUND();
  const data = { status };
  if (answer !== undefined) {
    const text = answer || null;
    data.answer = text;
    // 답변 내용이 바뀔 때만 답한 시각을 새로
    if (text !== existing.answer) data.answeredAt = text ? new Date() : null;
  }
  const inquiry = await prisma.inquiry.update({ where: { id: inquiryId }, data, include: withUser });
  return toInquiryForAdmin(inquiry);
}

/** 관리자: 문의 지우기 (장난 문의 등) */
export async function deleteForAdmin(inquiryId) {
  const { count } = await prisma.inquiry.deleteMany({ where: { id: inquiryId } });
  if (count === 0) throw NOT_FOUND();
}
