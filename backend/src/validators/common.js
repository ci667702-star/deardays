import { z } from 'zod';

export const idSchema = (label = 'ID') =>
  z.coerce
    .number({ error: `${label} 값이 올바르지 않아요.` })
    .int(`${label} 값이 올바르지 않아요.`)
    .positive(`${label} 값이 올바르지 않아요.`);

export const idParamSchema = z.object({ id: idSchema() });
export const roomIdParamSchema = z.object({ roomId: idSchema('공유 공간') });

/** 앞뒤 공백을 지운 필수 문자열 */
export const requiredText = (label, max, { min = 1 } = {}) =>
  z
    .string({ error: `${label}을(를) 입력해 주세요.` })
    .trim()
    .min(min, min > 1 ? `${label}은(는) ${min}자 이상이어야 해요.` : `${label}을(를) 입력해 주세요.`)
    .max(max, `${label}은(는) ${max}자 이하로 써 주세요.`);
