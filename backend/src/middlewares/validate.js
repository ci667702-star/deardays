import { HttpError } from '../utils/HttpError.js';

/**
 * zod 스키마로 req[source]를 검사한다.
 * Express 5에서는 req.query 를 덮어쓸 수 없으므로 정제된 값은 req.valid[source] 에 담는다.
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const [issue] = result.error.issues;
      throw HttpError.badRequest(issue?.message ?? '입력값을 확인해 주세요.', 'VALIDATION_ERROR');
    }
    req.valid = { ...(req.valid ?? {}), [source]: result.data };
    next();
  };
}
