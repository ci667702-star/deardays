import { z } from 'zod';
import { requiredText } from './common.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailSchema = z
  .string({ error: '이메일을 입력해 주세요.' })
  .trim()
  .toLowerCase()
  .min(1, '이메일을 입력해 주세요.')
  .max(191, '이메일이 너무 길어요.')
  .regex(EMAIL_PATTERN, '이메일 형식이 올바르지 않아요.');

export const passwordSchema = z
  .string({ error: '비밀번호를 입력해 주세요.' })
  .min(8, '비밀번호는 8자 이상이어야 해요.')
  .max(64, '비밀번호는 64자 이하로 정해 주세요.')
  .regex(/[A-Za-z]/, '비밀번호에 영문을 하나 이상 넣어 주세요.')
  .regex(/\d/, '비밀번호에 숫자를 하나 이상 넣어 주세요.');

export const nicknameSchema = requiredText('닉네임', 20, { min: 2 });

export const registerSchema = z.object({
  email: emailSchema,
  nickname: nicknameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: '비밀번호를 입력해 주세요.' }).min(1, '비밀번호를 입력해 주세요.').max(64),
});

export const emailQuerySchema = z.object({ email: emailSchema });
