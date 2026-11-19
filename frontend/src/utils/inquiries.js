// 문의 종류와 상태 (서버: backend/src/config/constants.js 의 INQUIRY_* 와 같은 값)

export const INQUIRY_CATEGORIES = [
  { value: 'bug', label: '오류 신고' },
  { value: 'idea', label: '기능 제안' },
  { value: 'account', label: '계정' },
  { value: 'etc', label: '기타' },
];

export const INQUIRY_MAX_LENGTH = 2000;
export const INQUIRY_MIN_LENGTH = 5;

export const categoryLabel = (value) => INQUIRY_CATEGORIES.find((item) => item.value === value)?.label ?? '기타';

/** 보낸 사람이 보는 상태 이름 */
export function inquiryStatusLabel(inquiry) {
  if (inquiry.status === 'open') return '확인 중';
  return inquiry.answer ? '답변 완료' : '처리 완료';
}
