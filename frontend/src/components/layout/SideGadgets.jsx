import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRooms } from '../../context/RoomContext.jsx';
import { useClock } from '../../hooks/useClock.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus.js';
import { diaryService } from '../../services/diaryService.js';
import { WEEKDAYS, addDays, daysUntil, parseDateString, todayString } from '../../utils/date.js';
import { prefs } from '../../utils/storage.js';
import { cx } from '../../utils/cx.js';
import { PARTNER_SEAL } from '../diary/DiaryList.jsx';
import Avatar from '../ui/Avatar.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';
import Window from '../ui/Window.jsx';

// 넓은 화면(1600px 이상)에서 본문 양옆의 빈 자리에 두는 작은 창들

/** ISO 시각 → 이 기기 시간대의 'YYYY-MM-DD' */
const localDateOf = (iso) => todayString(new Date(iso));

/** 다음 기념일: 100일 단위와 1년(365일) 단위 중 가까운 쪽 */
function nextMilestone(day) {
  const by100 = Math.ceil(day / 100) * 100;
  const byYear = Math.ceil(day / 365) * 365;
  const target = Math.min(by100, byYear);
  const label = target === byYear ? `${target / 365}주년` : `${target}일`;
  return { label, left: target - day };
}

function TogetherDays({ room, meId }) {
  const today = todayString();
  const day = -daysUntil(localDateOf(room.createdAt), today) + 1;
  const next = nextMilestone(day);
  const partner = room.members.find((member) => member.id !== meId);
  const me = room.members.find((member) => member.id === meId);
  const many = room.members.length > 2;

  return (
    <Window title="함께한 날" icon={<PixelIcon name="heart" size={14} />} maximizable={false} animate={false}>
      {many ? (
        <ul className="flex flex-wrap justify-center gap-1.5" aria-label={`함께 쓰는 사람 ${room.members.length}명`}>
          {[me, ...room.members.filter((member) => member.id !== meId)].filter(Boolean).map((member) => (
            <li key={member.id} title={member.nickname}>
              <Avatar user={member} size={30} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <Avatar user={me} size={36} />
          <PixelIcon name="heart" size={22} />
          {partner ? (
            <Avatar user={partner} size={36} />
          ) : (
            <span className="grid size-9 place-items-center border-2 border-dashed border-shade text-[16px] text-muted" aria-hidden="true">
              ?
            </span>
          )}
        </div>
      )}
      <p className="mt-3 text-center text-[13px]">{room.name}</p>
      <p className="text-center text-[30px] font-bold leading-tight">{day}일째</p>
      <p className="font-small mt-1 text-center text-[12px] text-muted">
        {next.left === 0 ? `오늘이 ${next.label}이에요!` : `${next.label}까지 D-${next.left}`}
      </p>
    </Window>
  );
}

const timeFormat = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' });

function ClockGadget() {
  const now = useClock();
  const today = todayString(now);
  const { year, monthIndex, day } = parseDateString(today);
  return (
    <Window title="시계" icon={<PixelIcon name="hourglass" size={14} />} maximizable={false} animate={false}>
      <time dateTime={now.toISOString()} className="block text-center">
        <span className="block text-[34px] leading-tight">{timeFormat.format(now)}</span>
        <span className="font-small mt-1 block text-[12px] text-muted">
          {year}년 {monthIndex + 1}월 {day}일 {WEEKDAYS[now.getDay()]}요일
        </span>
      </time>
    </Window>
  );
}

/** 이번 주(일~토) 누가 일기를 썼는지 */
function ThisWeek({ room, meId }) {
  const today = todayString();
  const weekStart = addDays(today, -new Date().getDay());
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const week = useFetch(
    () => diaryService.list({ roomId: room.id, from: days[0], to: days[6], limit: 50 }),
    [room.id, days[0]],
  );
  useRefreshOnFocus(week.reload);

  const byDate = new Map();
  for (const diary of week.data?.items ?? []) {
    if (!byDate.has(diary.diaryDate)) byDate.set(diary.diaryDate, new Set());
    byDate.get(diary.diaryDate).add(diary.author.id === meId ? 'me' : 'partner');
  }

  return (
    <Window
      title="이번 주 우리"
      icon={<PixelIcon name="calendar" size={14} />}
      maximizable={false}
      animate={false}
      statusBar={<span className="flex-1">이번 주 일기 {week.data?.total ?? '-'}편</span>}
    >
      <ol className="grid grid-cols-7 gap-1 text-center">
        {days.map((date, index) => {
          const who = byDate.get(date);
          const isToday = date === today;
          return (
            <li key={date}>
              <Link
                to={`/calendar?date=${date}`}
                className={cx(
                  'flex flex-col items-center gap-1 px-0.5 py-1 no-underline',
                  isToday ? 'bg-select text-select-text' : 'hover:bg-lav-soft',
                )}
                aria-label={`${WEEKDAYS[index]}요일${who ? ` · ${who.has('me') ? '나' : ''}${who.size === 2 ? ', ' : ''}${who.has('partner') ? '친구' : ''} 씀` : ''}`}
              >
                <span className="font-small text-[11px]">{WEEKDAYS[index]}</span>
                <span className="font-small text-[12px]">{parseDateString(date).day}</span>
                <span className="flex h-[22px] flex-col items-center justify-center gap-px">
                  {who?.has('me') && <PixelIcon name="heartSmall" size={9} />}
                  {who?.has('partner') && <PixelIcon name="heartSmall" size={9} palette={PARTNER_SEAL} />}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="font-small mt-2 flex items-center justify-center gap-3 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1">
          <PixelIcon name="heartSmall" size={9} /> 나
        </span>
        <span className="inline-flex items-center gap-1">
          <PixelIcon name="heartSmall" size={9} palette={PARTNER_SEAL} /> 친구
        </span>
      </p>
    </Window>
  );
}

/** 나만 보는 메모. 이 기기에만 저장된다 */
function MemoGadget({ userId }) {
  const key = `memo:${userId}`;
  const [text, setText] = useState(() => prefs.get(key) ?? '');
  const [saved, setSaved] = useState(true);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    setSaved(false);
    const timer = setTimeout(() => {
      prefs.set(key, text);
      setSaved(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [key, text]);

  return (
    <Window
      title="메모장"
      icon={<PixelIcon name="note" size={14} />}
      maximizable={false}
      animate={false}
      statusBar={<span className="flex-1">{saved ? '이 기기에만 저장돼요' : '저장하는 중...'}</span>}
    >
      <label htmlFor="side-memo" className="sr-only">
        나만 보는 메모
      </label>
      <textarea
        id="side-memo"
        className="ink block min-h-[220px] w-full resize-y bg-cream p-2 text-[18px] leading-snug shadow-[var(--bevel-in)] outline-none focus-visible:outline-1 focus-visible:outline-focus"
        value={text}
        maxLength={2000}
        onChange={(event) => setText(event.target.value)}
        placeholder={'오늘 쓰고 싶은 것\n친구한테 할 말...'}
      />
    </Window>
  );
}

export function LeftGadgets() {
  const { user } = useAuth();
  const { currentRoom } = useRooms();
  return (
    <div className="flex flex-col gap-4">
      {currentRoom && <TogetherDays room={currentRoom} meId={user.id} />}
      <ClockGadget />
    </div>
  );
}

export function RightGadgets() {
  const { user } = useAuth();
  const { currentRoom } = useRooms();
  return (
    <div className="flex flex-col gap-4">
      {currentRoom && <ThisWeek room={currentRoom} meId={user.id} />}
      <MemoGadget userId={user.id} />
    </div>
  );
}
