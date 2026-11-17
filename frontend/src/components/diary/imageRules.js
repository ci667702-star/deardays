// 서버와 같은 업로드 규칙 (backend/src/config/constants.js)
export const MAX_IMAGES = 6;
export const MAX_IMAGE_MB = 5;
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ACCEPT_ATTR = '.jpg,.jpeg,.png,.gif,.webp';

/**
 * 고른 파일들을 검사해 올릴 수 있는 것과 문제를 나눠 돌려준다.
 * @returns {{ accepted: File[], problems: string[] }}
 */
export function checkImageFiles(files, currentCount) {
  const accepted = [];
  const problems = [];
  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      problems.push(`${file.name}: JPG, PNG, GIF, WEBP 사진만 올릴 수 있어요.`);
    } else if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      problems.push(`${file.name}: ${MAX_IMAGE_MB}MB보다 커서 올릴 수 없어요.`);
    } else if (currentCount + accepted.length >= MAX_IMAGES) {
      problems.push(`사진은 최대 ${MAX_IMAGES}장까지 첨부할 수 있어요.`);
      break;
    } else {
      accepted.push(file);
    }
  }
  return { accepted, problems };
}
