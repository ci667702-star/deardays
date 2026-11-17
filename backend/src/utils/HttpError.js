/** 상태 코드와 사용자에게 보여 줄 메시지를 함께 담는 에러 */
export class HttpError extends Error {
  constructor(status, message, code = undefined) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }

  static badRequest(message, code = 'BAD_REQUEST') {
    return new HttpError(400, message, code);
  }

  static unauthorized(message = '로그인이 필요해요.', code = 'UNAUTHORIZED') {
    return new HttpError(401, message, code);
  }

  static forbidden(message = '이 작업을 할 권한이 없어요.', code = 'FORBIDDEN') {
    return new HttpError(403, message, code);
  }

  static notFound(message = '요청한 내용을 찾을 수 없어요.', code = 'NOT_FOUND') {
    return new HttpError(404, message, code);
  }

  static conflict(message, code = 'CONFLICT') {
    return new HttpError(409, message, code);
  }
}
