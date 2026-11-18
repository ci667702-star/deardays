import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WEEKDAYS, buildMonthGrid, parseDateString, todayString } from '../../utils/date.js';
import { cx } from '../../utils/cx.js';
import { FACE_MINE, FACE_THEIRS, moodOf } from '../../utils/moods.js';
import PixelIcon from '../ui/PixelIcon.jsx';

// 친구가 쓴 날은 민트 하트
const PARTNER_HEART = { p: '#8fdde4', P: '#3f9faa' };

/** 그날 일기 표시: 기분을 골랐으면 작성자 색 얼굴, 아니면 작성자 색 하트 */
function DayMarker({ entry, mine = false, size }) {
  const mood = moodOf(entry.mood);
  if (mood) return <PixelIcon name={mood.icon} size={size} palette={mine ? FACE_MINE : FACE_THEIRS} />;
  return <PixelIcon name="heartSmall" size={size - 1} palette={mine ? undefined : PARTNER_HEART} />;
}

function addDays(value, amount) {
  const { year, monthIndex, day } = parseDateString(value);
  const date = new Date(Date.UTC(year, monthIndex, day + amount));
  return date.toISOString().slice(0, 10);
}

/**
 * 월 달력.
 * - days: Map<'YYYY-MM-DD', [{ id, title, authorId }]>
 * - 일기가 있는 날: 내가 쓴 날은 분홍 하트, 친구가 쓴 날은 라벤더 하트
 * - 화살표 키로 날짜를 옮기고 Enter로 고른다 (달 경계를 넘으면 달이 바뀜)
 */
export default function MonthCalendar({
  year,
  monthIndex,
  days,
  meId,
  selectedDate,
  onSelectDate,
  onMonthChange,
  size = 'lg',
  loading = false,
}) {
  const compact = size === 'sm';
  const today = todayString();
  const cells = buildMonthGrid(year, monthIndex);
  const gridRef = useRef(null);
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

  const initialFocus = () => {
    if (selectedDate?.startsWith(monthPrefix)) return selectedDate;
    if (today.startsWith(monthPrefix)) return today;
    return `${monthPrefix}-01`;
  };
  const [focusDate, setFocusDate] = useState(initialFocus);
  const pendingFocus = useRef(false);

  // 달이 바뀌거나 선택이 바뀌면 포커스 기준 날짜도 맞춘다
  useEffect(() => {
    setFocusDate((current) => (current.startsWith(monthPrefix) ? current : initialFocus()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthPrefix, selectedDate]);

  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    gridRef.current?.querySelector(`[data-date="${focusDate}"]`)?.focus();
  }, [focusDate]);

  const moveMonth = (offset) => {
    const date = new Date(Date.UTC(year, monthIndex + offset, 1));
    onMonthChange(date.getUTCFullYear(), date.getUTCMonth());
  };

  const handleKeyDown = (event, value) => {
    const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    const next = addDays(value, offset);
    pendingFocus.current = true;
    setFocusDate(next);
    if (!next.startsWith(monthPrefix)) {
      const { year: y, monthIndex: m } = parseDateString(next);
      onMonthChange(y, m);
    }
  };

  const goToday = () => {
    const { year: y, monthIndex: m } = parseDateString(today);
    onMonthChange(y, m);
    onSelectDate?.(today);
  };

  return (
    <div className={cx(loading && 'opacity-70')} aria-busy={loading || undefined}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <button type="button" className="btn btn--icon btn--sm" onClick={() => moveMonth(-1)} aria-label="이전 달">
          <ChevronLeft size={14} />
        </button>
        <p className={compact ? 'text-[15px]' : 'text-[18px]'} aria-live="polite">
          {year}년 {monthIndex + 1}월
        </p>
        <div className="flex gap-1">
          {!compact && (
            <button type="button" className="btn btn--sm" onClick={goToday}>
              오늘
            </button>
          )}
          <button type="button" className="btn btn--icon btn--sm" onClick={() => moveMonth(1)} aria-label="다음 달">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="sunken p-1">
        <div className="grid grid-cols-7 bg-face" aria-hidden="true">
          {WEEKDAYS.map((label, i) => (
            <span
              key={label}
              className={cx(
                'font-small py-1 text-center text-[12px]',
                i === 0 && 'text-pink-deep',
                i === 6 && 'text-title',
              )}
            >
              {label}
            </span>
          ))}
        </div>
        <div ref={gridRef} role="group" aria-label={`${year}년 ${monthIndex + 1}월 달력`} className="grid grid-cols-7">
          {cells.map((cell) => {
            const entries = days.get(cell.value) ?? [];
            const mine = entries.find((d) => d.authorId === meId);
            const theirs = entries.find((d) => d.authorId !== meId);
            const isToday = cell.value === today;
            const isSelected = cell.value === selectedDate;
            const label = `${parseDateString(cell.value).monthIndex + 1}월 ${cell.day}일${isToday ? ', 오늘' : ''}${
              entries.length ? `, 일기 ${entries.length}편` : ''
            }`;

            return (
              <button
                key={cell.value}
                type="button"
                data-date={cell.value}
                tabIndex={cell.value === focusDate ? 0 : -1}
                aria-label={label}
                aria-pressed={isSelected}
                onClick={() => {
                  setFocusDate(cell.value);
                  onSelectDate?.(cell.value);
                }}
                onKeyDown={(event) => handleKeyDown(event, cell.value)}
                className={cx(
                  'relative flex flex-col items-center outline-none',
                  compact ? 'h-10 justify-center gap-0.5 sm:h-11' : 'min-h-[64px] justify-start gap-1 p-1 sm:min-h-[78px]',
                  cell.inMonth ? 'text-ink' : 'text-shade',
                  isSelected ? 'bg-lav-soft shadow-[var(--bevel-thin-in)]' : 'hover:bg-cream',
                  'focus-visible:outline-1 focus-visible:outline-dotted focus-visible:outline-offset-[-3px] focus-visible:outline-dark',
                )}
              >
                <span
                  className={cx(
                    'grid place-items-center leading-none',
                    compact ? 'size-6 text-[12px] font-small' : 'size-7 text-[15px]',
                    isToday && 'bg-select text-select-text',
                    !isToday && cell.weekday === 0 && cell.inMonth && 'text-pink-deep',
                  )}
                >
                  {cell.day}
                </span>
                {(mine || theirs) && (
                  <span className="flex items-center gap-0.5" aria-hidden="true">
                    {mine && <DayMarker entry={mine} mine size={compact ? 10 : 13} />}
                    {theirs && <DayMarker entry={theirs} size={compact ? 10 : 13} />}
                  </span>
                )}
                {!compact && entries.length > 0 && (
                  <span className="font-small hidden w-full truncate px-0.5 text-[11px] leading-tight text-muted sm:block">
                    {entries[0].title}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="font-small mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
        <span className="inline-flex items-center gap-1">
          <PixelIcon name="heartSmall" size={10} /> 내가 쓴 날
        </span>
        <span className="inline-flex items-center gap-1">
          <PixelIcon name="heartSmall" size={10} palette={PARTNER_HEART} /> 친구가 쓴 날
        </span>
        <span className="inline-flex items-center gap-1">
          <PixelIcon name="moodHappy" size={11} palette={FACE_MINE} /> 표정은 그날 기분
        </span>
        {!compact && (
          <span className="inline-flex items-center gap-1">
            <span className="inline-block size-3 bg-select" /> 오늘
          </span>
        )}
      </div>
    </div>
  );
}
