import { useEffect, useState } from 'react';

/** 작업 표시줄 시계용: 분이 바뀔 때마다 갱신되는 현재 시각 */
export function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer;
    const tick = () => {
      const current = new Date();
      setNow(current);
      timer = setTimeout(tick, 60000 - (current.getSeconds() * 1000 + current.getMilliseconds()) + 50);
    };
    timer = setTimeout(tick, 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return now;
}
