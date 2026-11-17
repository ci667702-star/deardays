import { z } from 'zod';
import { nicknameSchema, passwordSchema } from './auth.validators.js';

const currentPasswordSchema = z
  .string({ error: '지금 비밀번호를 입력해 주세요.' })
  .min(1, '지금 비밀번호를 입력해 주세요.')
  .max(64);

export const changePasswordSchema = z.object({
  currentPassword: currentPasswordSchema,
  newPassword: passwordSchema,
});

export const deleteAccountSchema = z.object({
  password: currentPasswordSchema,
});

export const updateProfileSchema = z
  .object({
    nickname: nicknameSchema.optional(),
    introduction: z
      .string({ error: '자기소개 형식이 올바르지 않아요.' })
      .trim()
      .max(300, '자기소개는 300자 이하로 써 주세요.')
      .optional(),
  })
  .refine((data) => data.nickname !== undefined || data.introduction !== undefined, {
    message: '바꿀 내용을 입력해 주세요.',
  });
