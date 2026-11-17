import { useCallback, useEffect, useState } from 'react';

/**
 * 비동기 조회를 실행하고 { data, loading, error, reload, setData } 를 돌려준다.
 * deps 가 바뀌면 다시 불러오고, 컴포넌트가 사라진 뒤 도착한 응답은 버린다.
 */
export function useFetch(fetcher, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, loading: enabled, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setState((prev) => ({ ...prev, loading: false }));
      return undefined;
    }
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState((prev) => ({ data: prev.data, loading: false, error }));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version, enabled]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const setData = useCallback(
    (updater) => setState((prev) => ({ ...prev, data: typeof updater === 'function' ? updater(prev.data) : updater })),
    [],
  );

  return { ...state, reload, setData };
}
