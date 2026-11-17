/** axios 에러에서 사용자에게 보여 줄 메시지를 꺼낸다. */
export function getErrorMessage(error, fallback = '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.') {
  if (!error) return fallback;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ERR_NETWORK') return '서버에 연결할 수 없어요. 백엔드 서버가 켜져 있는지 확인해 주세요.';
  if (error.code === 'ECONNABORTED') return '응답이 너무 늦어요. 네트워크 상태를 확인해 주세요.';
  if (typeof error.message === 'string' && !error.isAxiosError) return error.message;
  return fallback;
}

export function getErrorStatus(error) {
  return error?.response?.status ?? null;
}
