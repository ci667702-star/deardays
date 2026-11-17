import { useMemo } from 'react';
import { diaryService } from '../services/diaryService.js';
import { monthString } from '../utils/date.js';
import { useFetch } from './useFetch.js';

/** 한 달 동안 일기가 있는 날짜를 Map<'YYYY-MM-DD', 일기 요약[]> 으로 불러온다. */
export function useCalendarDays(roomId, year, monthIndex) {
  const month = monthString(year, monthIndex);
  const { data, loading, error, reload } = useFetch(
    () => diaryService.calendar({ roomId, month }),
    [roomId, month],
    { enabled: Boolean(roomId) },
  );

  const days = useMemo(() => {
    const map = new Map();
    // 다른 달의 응답이 잠깐 남아 있어도 섞이지 않게 월을 확인한다
    if (data?.month === month) data.days.forEach((day) => map.set(day.date, day.diaries));
    return map;
  }, [data, month]);

  return { days, loading, error, reload };
}
