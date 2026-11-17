import { z } from 'zod';
import { isValidInviteCodeFormat, normalizeInviteCode } from '../utils/inviteCode.js';
import { requiredText } from './common.js';

export const roomNameSchema = z.object({
  name: requiredText('공간 이름', 40),
});

export const joinRoomSchema = z.object({
  inviteCode: z
    .string({ error: '초대 코드를 입력해 주세요.' })
    .transform(normalizeInviteCode)
    .refine((code) => code.length > 0, '초대 코드를 입력해 주세요.')
    .refine(isValidInviteCodeFormat, '초대 코드는 영문 대문자와 숫자 8자리예요.'),
});
