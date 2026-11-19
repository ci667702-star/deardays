import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { PenLine } from 'lucide-react';
import RoomGate from '../components/room/RoomGate.jsx';
import TopicEntries from '../components/topic/TopicEntries.jsx';
import Button, { ButtonLink } from '../components/ui/Button.jsx';
import { EmptyState, ErrorMessage, Loading } from '../components/ui/Feedback.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import Window from '../components/ui/Window.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useRooms } from '../context/RoomContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus.js';
import { topicService } from '../services/topicService.js';
import { formatDiaryDate, todayString } from '../utils/date.js';
import { getErrorMessage } from '../utils/errors.js';

const PAGE_SIZE = 10;

export default function TopicsPage() {
  useDocumentTitle('오늘의 주제');
  return (
    <RoomGate>
      <Topics />
    </RoomGate>
  );
}

/** 공간의 주제 기록을 '더 보기'로 이어 붙여 불러온다 */
function useTopicHistory(roomId) {
  const toast = useToast();
  const [state, setState] = useState({ items: [], page: 0, hasMore: false, loading: true, error: null });

  const load = async (page, replace = false) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await topicService.list({ roomId, page, limit: PAGE_SIZE });
      setState((s) => ({
        items: replace ? data.items : [...s.items, ...data.items.filter((item) => !s.items.some((x) => x.id === item.id))],
        page,
        hasMore: data.hasMore,
        loading: false,
        error: null,
      }));
    } catch (error) {
      if (!replace) toast.error(getErrorMessage(error));
      setState((s) => ({ ...s, loading: false, error }));
    }
  };

  useEffect(() => {
    load(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  return { ...state, reload: () => load(1, true), more: () => load(state.page + 1) };
}

function TopicCard({ topic, members, big = false }) {
  const mine = topic.entries.find((entry) => entry.isMine);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1">
        <p className="font-small text-[12px] text-muted">{formatDiaryDate(topic.date)}</p>
        <p className={big ? 'ink mt-1 text-[24px] leading-snug' : 'ink mt-0.5 text-[18px] leading-snug'}>{topic.content}</p>
        <div className="mt-2.5">
          <TopicEntries members={members} entries={topic.entries} />
        </div>
      </div>
      {!mine && (
        <ButtonLink
          to={`/diaries/new?topic=${topic.id}`}
          variant={big ? 'accent' : undefined}
          size={big ? undefined : 'sm'}
          icon={<PenLine size={14} />}
          className="shrink-0 self-start"
        >
          이 주제로 쓰기
        </ButtonLink>
      )}
    </div>
  );
}

function Topics() {
  const { user } = useAuth();
  const { currentRoom } = useRooms();
  const navigate = useNavigate();
  const history = useTopicHistory(currentRoom.id);
  useRefreshOnFocus(history.reload);

  const today = todayString();
  const todayTopic = history.items[0]?.date === today ? history.items[0] : null;
  const past = todayTopic ? history.items.slice(1) : history.items;
  const firstLoad = history.loading && history.page === 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <Window
        title={`오늘의 주제 - ${formatDiaryDate(today, { withYear: false })}`}
        icon={<PixelIcon name="note" size={14} />}
        onClose={() => navigate('/')}
        closeLabel="홈으로"
        statusBar={
          <>
            <span className="flex-1">주제는 날마다 하나씩 열려요</span>
            {user.isAdmin && (
              <Link to="/admin" className="text-inherit">
                주제 편집 (관리자)
              </Link>
            )}
          </>
        }
      >
        {firstLoad && <Loading compact label="오늘의 주제를 불러오는 중..." />}
        {history.error && history.page === 0 && <ErrorMessage error={history.error} onRetry={history.reload} />}
        {!firstLoad && !history.error && todayTopic && <TopicCard topic={todayTopic} members={currentRoom.members} big />}
        {!firstLoad && !history.error && !todayTopic && (
          <EmptyState
            icon="note"
            title="오늘은 주제가 없어요"
            description="주제 없이 자유롭게 써도 좋아요. 아래에서 지난 주제로 써 볼 수도 있어요."
            action={
              <ButtonLink to="/diaries/new" icon={<PenLine size={14} />}>
                자유롭게 쓰기
              </ButtonLink>
            }
          />
        )}
      </Window>

      <Window
        title="지난 주제"
        icon={<PixelIcon name="folder" size={14} />}
        statusBar={<span className="flex-1">지금까지 열린 주제 {history.items.length}개{history.hasMore ? ' 이상' : ''}</span>}
      >
        {!firstLoad && past.length === 0 && !history.error && (
          <p className="font-small py-4 text-center text-[13px] text-muted">아직 지난 주제가 없어요.</p>
        )}
        {past.length > 0 && (
          <ul className="flex flex-col">
            {past.map((topic) => (
              <li key={topic.id} className="border-b border-light py-3 first:pt-0 last:border-b-0">
                <TopicCard topic={topic} members={currentRoom.members} />
              </li>
            ))}
          </ul>
        )}
        {history.hasMore && (
          <div className="mt-3 flex justify-center">
            <Button onClick={history.more} loading={history.loading}>
              더 보기
            </Button>
          </div>
        )}
      </Window>

    </div>
  );
}
