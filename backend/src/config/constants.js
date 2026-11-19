// 서비스 전반에서 쓰는 규칙 값

/** 하나의 공유 공간에 참여할 수 있는 최대 인원 (화면: frontend/src/utils/rooms.js 와 같은 값) */
export const MAX_ROOM_MEMBERS = 6;

/** 일기 한 편에 첨부할 수 있는 최대 사진 수 */
export const MAX_DIARY_IMAGES = 6;

/** 한 공간에 둘 수 있는 최대 할 일 수 */
export const MAX_TODOS_PER_ROOM = 300;

/** 초대 코드 길이와 문자 집합 (헷갈리는 0/O, 1/I 제외) */
export const INVITE_CODE_LENGTH = 8;
export const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** 업로드 허용 이미지: 확장자 → 허용 MIME 타입 */
export const ALLOWED_IMAGE_TYPES = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.gif': ['image/gif'],
  '.webp': ['image/webp'],
};

export const BCRYPT_ROUNDS = 12;

/** 일기 기분·날씨 값 (화면의 도트 아이콘과 짝) */
export const MOODS = ['happy', 'excited', 'calm', 'sad', 'angry'];
export const WEATHERS = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];

/** 타임캡슐 편지는 최대 몇 년 뒤까지 보낼 수 있는지 */
export const LETTER_MAX_YEARS = 10;

/** 새 소식 목록에 한 번에 보여 줄 최대 개수 */
export const NOTIFICATION_LIST_LIMIT = 50;

/** 도장 종류 (화면의 도장 모양·글자와 짝: frontend/src/utils/stamps.js) */
export const STAMP_KINDS = ['great', 'wow', 'lol', 'pat', 'same', 'best'];

/** 오늘의 주제: 글자 수, 한 번에 여러 개 넣을 때 최대 개수 */
export const TOPIC_MAX_LENGTH = 200;
export const TOPIC_BULK_MAX = 100;

/** 문의: 종류, 글자 수, 아직 처리 안 된 문의를 한 사람이 몇 개까지 둘 수 있는지 (도배 방지) */
export const INQUIRY_CATEGORIES = ['bug', 'idea', 'account', 'etc'];
export const INQUIRY_MAX_LENGTH = 2000;
export const INQUIRY_OPEN_MAX = 10;

/** 낙서 그림의 최대 가로·세로 (픽셀) */
export const DOODLE_MAX_SIZE = 1200;
