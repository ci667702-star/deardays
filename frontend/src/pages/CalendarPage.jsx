import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { PenLine } from 'lucide-react';
import MonthCalendar from '../components/calendar/MonthCalendar.jsx';
import DiaryList from '../components/diary/DiaryList.jsx';
import RoomGate from '../components/room/RoomGate.jsx';
import { ButtonLink } from '../components/ui/Button.jsx';
import { EmptyState, ErrorMessage, Loading } from '../components/ui/Feedback.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import Window from '../components/ui/Window.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useRooms } from '../context/RoomContext.jsx';
import { useCalendarDays } from '../hooks/useCalendarDays.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus.js';
import { diaryService } from '../services/diaryService.js';
import { formatDiaryDate, isValidDateString, parseDateString, todayString } from '../utils/date.js';

export default function CalendarPage() {
  useDocumentTitle('달력');
  return (
    <RoomGate>
      <CalendarView />
    </RoomGate>
  );
}

function CalendarView() {
  const { user } = useAuth();
  const { currentRoom } = useRooms();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryDate = searchParams.get('date');
  const selected = isValidDateString(queryDate) ? queryDate : todayString();

  const [view, setView] = useState(() => {
    const { year, monthIndex } = parseDateString(selected);
    return { year, monthIndex };
  });

  const calendar = useCalendarDays(currentRoom.id, view.year, view.monthIndex);
  const dayDiaries = useFetch(
    () => diaryService.list({ roomId: currentRoom.id, date: selected, sort: 'oldest', limit: 50 }),
    [currentRoom.id, selected],
  );

  useRefreshOnFocus(() => {
    calendar.reload();
    dayDiaries.reload();
  });

  const selectDate = (date) => {
    setSearchParams({ date }, { replace: true });
    const { year, monthIndex } = parseDateString(date);
    if (year !== view.year || monthIndex !== view.monthIndex) setView({ year, monthIndex });
  };

  const entries = [...calendar.days.values()].flat();
  const myDays = [...calendar.days.values()].filter((list) => list.some((d) => d.authorId === user.id)).length;
  const theirDays = [...calendar.days.values()].filter((list) => list.some((d) => d.authorId !== user.id)).length;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Window
        title={`달력 - ${currentRoom.name}`}
        icon={<PixelIcon name="calendar" size={14} />}
        statusBar={
          <>
            <span className="flex-1">
              {view.monthIndex + 1}월 일기 {entries.length}편
            </span>
            <span>내가 쓴 날 {myDays}일</span>
            <span>친구가 쓴 날 {theirDays}일</span>
          </>
        }
      >
        {calendar.error ? (
          <ErrorMessage error={calendar.error} onRetry={calendar.reload} />
        ) : (
          <MonthCalendar
            year={view.year}
            monthIndex={view.monthIndex}
            days={calendar.days}
            meId={user.id}
            selectedDate={selected}
            loading={calendar.loading}
            onMonthChange={(year, monthIndex) => setView({ year, monthIndex })}
            onSelectDate={selectDate}
          />
        )}
      </Window>

      <Window
        title={formatDiaryDate(selected)}
        icon={<PixelIcon name="book" size={14} />}
        toolbar={
          <ButtonLink to={`/diaries/new?date=${selected}`} size="sm" variant="accent" icon={<PenLine size={12} />}>
            이 날의 일기 쓰기
          </ButtonLink>
        }
        statusBar={<span className="flex-1">이 날의 일기 {dayDiaries.data?.total ?? 0}편</span>}
      >
        {dayDiaries.loading && !dayDiaries.data && <Loading compact label="이 날의 일기를 찾는 중..." />}
        {dayDiaries.error && <ErrorMessage error={dayDiaries.error} onRetry={dayDiaries.reload} />}
        {dayDiaries.data && dayDiaries.data.items.length === 0 && (
          <EmptyState
            icon="calendar"
            title="이 날은 아직 비어 있어요"
            description="그날 있었던 일이 떠오른다면 지금 적어도 괜찮아요."
          />
        )}
        {dayDiaries.data && dayDiaries.data.items.length > 0 && <DiaryList diaries={dayDiaries.data.items} showHeader={false} />}
      </Window>
    </div>
  );
}
