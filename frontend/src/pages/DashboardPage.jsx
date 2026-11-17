import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FolderOpen, PenLine, RefreshCw } from 'lucide-react';
import MonthCalendar from '../components/calendar/MonthCalendar.jsx';
import DiaryList from '../components/diary/DiaryList.jsx';
import Logo from '../components/layout/Logo.jsx';
import InviteCodeBox from '../components/room/InviteCodeBox.jsx';
import MemberPair from '../components/room/MemberPair.jsx';
import RoomGate from '../components/room/RoomGate.jsx';
import TodoWidget from '../components/todo/TodoWidget.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button, { ButtonLink } from '../components/ui/Button.jsx';
import { EmptyState, ErrorMessage, Loading } from '../components/ui/Feedback.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import Window from '../components/ui/Window.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useRooms } from '../context/RoomContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useCalendarDays } from '../hooks/useCalendarDays.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus.js';
import { diaryService } from '../services/diaryService.js';
import { parseDateString, todayString, weekdayOf } from '../utils/date.js';
import { getErrorMessage } from '../utils/errors.js';
import { DAILY_NOTES, noteIndexForDate } from '../utils/quotes.js';

export default function DashboardPage() {
  useDocumentTitle('홈');
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3 text-desk-text">
        <Logo size="sm" />
        <Link to="/me" className="flex items-center gap-2 px-1 text-[12px] no-underline hover:underline font-small">
          <span className="hidden sm:inline">{user.nickname}님</span>
          <Avatar user={user} size={28} />
        </Link>
      </header>
      <RoomGate>
        <Dashboard />
      </RoomGate>
    </div>
  );
}

function TodayNote({ nickname }) {
  const today = todayString();
  const [index, setIndex] = useState(() => noteIndexForDate(today));
  const { year, monthIndex, day } = parseDateString(today);

  return (
    <Window title="오늘의 한마디" icon={<PixelIcon name="bulb" size={14} />} bodyClassName="p-0">
      <div className="flex flex-col sm:flex-row">
        <div className="flex items-center gap-3 bg-hilite px-4 py-4 shadow-[var(--bevel-thin-in)] sm:w-[200px] sm:flex-col sm:items-start sm:justify-between">
          <PixelIcon name="bulb" size={40} />
          <div>
            <p className="font-small text-[12px] text-muted">{year}년</p>
            <p className="text-[30px] leading-tight">
              {monthIndex + 1}월 {day}일
            </p>
            <p className="text-[15px]">{weekdayOf(today)}요일</p>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4">
          <div>
            <p className="font-small text-[12px] text-muted">{nickname}님, 오늘 하루는 어땠나요?</p>
            <p className="ink mt-2 text-[20px] leading-relaxed" aria-live="polite">
              {DAILY_NOTES[index]}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button size="sm" onClick={() => setIndex((i) => (i + 1) % DAILY_NOTES.length)}>
              다음 한마디
            </Button>
            <ButtonLink to="/diaries/new" variant="accent" icon={<PenLine size={14} />}>
              새 일기 쓰기
            </ButtonLink>
          </div>
        </div>
      </div>
    </Window>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const { currentRoom, partner, refreshRoom } = useRooms();
  const toast = useToast();
  const navigate = useNavigate();
  const roomId = currentRoom.id;
  const [checking, setChecking] = useState(false);

  const recent = useFetch(() => diaryService.list({ roomId, limit: 5 }), [roomId]);

  const [view, setView] = useState(() => {
    const { year, monthIndex } = parseDateString(todayString());
    return { year, monthIndex };
  });
  const calendar = useCalendarDays(roomId, view.year, view.monthIndex);

  // 대시보드에 들어올 때마다 친구가 새로 참여했는지 등 공간 정보를 갱신
  useEffect(() => {
    refreshRoom(roomId).catch(() => {});
  }, [roomId, refreshRoom]);

  // 다른 탭에 있다 돌아오면 친구의 새 일기를 반영
  useRefreshOnFocus(() => {
    refreshRoom(roomId).catch(() => {});
    recent.reload();
    calendar.reload();
  });

  const checkPartner = async () => {
    setChecking(true);
    try {
      const room = await refreshRoom(roomId);
      recent.reload();
      calendar.reload();
      const joined = room.members.find((m) => m.id !== user.id);
      if (joined) toast.success(`${joined.nickname}님이 들어왔어요!`);
      else toast.info('아직 친구가 들어오지 않았어요.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setChecking(false);
    }
  };

  const monthCount = [...calendar.days.values()].reduce((sum, list) => sum + list.length, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-4">
        <TodayNote nickname={user.nickname} />

        <Window
          title={`최근 일기 - ${currentRoom.name}`}
          icon={<PixelIcon name="book" size={14} />}
          toolbar={
            <>
              <Link to="/diaries/new" className="btn-tool">
                <PenLine size={14} /> 새 일기
              </Link>
              <Link to="/room" className="btn-tool">
                <FolderOpen size={14} /> 모두 보기
              </Link>
            </>
          }
          statusBar={
            <>
              <span className="flex-1">전체 일기 {recent.data?.total ?? '-'}편</span>
              <span>최근 5편</span>
            </>
          }
        >
          {recent.loading && !recent.data && <Loading compact label="최근 일기를 불러오는 중..." />}
          {recent.error && <ErrorMessage error={recent.error} onRetry={recent.reload} />}
          {recent.data && recent.data.items.length === 0 && (
            <EmptyState
              title="아직 일기가 없어요"
              description="오늘의 첫 페이지를 써 볼까요? 친구가 들어오면 서로의 일기를 함께 볼 수 있어요."
              action={
                <ButtonLink to="/diaries/new" variant="default" icon={<PenLine size={14} />}>
                  첫 일기 쓰기
                </ButtonLink>
              }
            />
          )}
          {recent.data && recent.data.items.length > 0 && <DiaryList diaries={recent.data.items} />}
        </Window>

        <TodoWidget room={currentRoom} />
      </div>

      <div className="grid min-w-0 content-start items-start gap-4 md:grid-cols-2 lg:grid-cols-1">
        <Window title="우리 둘" icon={<PixelIcon name="heart" size={14} />}>
          <MemberPair
            members={currentRoom.members}
            meId={user.id}
            emptySeat={<p className="font-small text-[12px] text-muted">초대 코드를 보내 주세요</p>}
          />
          {!partner && (
            <div className="mt-4 flex flex-col gap-2">
              <hr className="etched" />
              <p className="font-small text-[12px] text-muted">친구가 이 코드를 입력하면 함께 쓸 수 있어요.</p>
              <InviteCodeBox code={currentRoom.inviteCode} compact />
              <Button size="sm" onClick={checkPartner} loading={checking} icon={<RefreshCw size={12} />} className="self-start">
                친구가 들어왔는지 확인
              </Button>
            </div>
          )}
        </Window>

        <Window
          title="달력"
          icon={<PixelIcon name="calendar" size={14} />}
          statusBar={<span className="flex-1">이번 달 일기 {monthCount}편</span>}
        >
          {calendar.error ? (
            <ErrorMessage error={calendar.error} onRetry={calendar.reload} />
          ) : (
            <MonthCalendar
              size="sm"
              year={view.year}
              monthIndex={view.monthIndex}
              days={calendar.days}
              meId={user.id}
              loading={calendar.loading}
              onMonthChange={(year, monthIndex) => setView({ year, monthIndex })}
              onSelectDate={(date) => navigate(`/calendar?date=${date}`)}
            />
          )}
        </Window>
      </div>
    </div>
  );
}
