import { randomInt } from 'node:crypto';
import { INVITE_CODE_ALPHABET, INVITE_CODE_LENGTH } from '../config/constants.js';

export function generateInviteCode() {
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
    code += INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

/** 사용자가 입력한 코드를 비교 가능한 형태로 정리 (공백·하이픈 제거, 대문자) */
export function normalizeInviteCode(input) {
  return String(input ?? '')
    .replace(/[\s-]/g, '')
    .toUpperCase();
}

const CODE_PATTERN = new RegExp(`^[${INVITE_CODE_ALPHABET}]{${INVITE_CODE_LENGTH}}$`);

export function isValidInviteCodeFormat(code) {
  return CODE_PATTERN.test(code);
}
