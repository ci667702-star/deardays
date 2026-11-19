import { Link } from 'react-router';
import { PenLine } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus.js';
import { topicService } from '../../services/topicService.js';
import { todayString } from '../../utils/date.js';
import { ButtonLink } from '../ui/Button.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';
import Window from '../ui/Window.jsx';
import TopicEntries from './TopicEntries.jsx';

/**
 * 홈의 '오늘의 주제' 창. 오늘 주제가 없으면 보이지 않는다 (관리자에게는 넣으라는 안내).
 */
export default function TodayTopicWindow({ room, className }) {
  const { user } = useAuth();
  const { data, reload } = useFetch(() => topicService.list({ roomId: room.id, limit: 1 }), [room.id]);
  useRefreshOnFocus(reload);

  const today = todayString();
  const topic = data?.items?.[0]?.date === today ? data.items[0] : null;

  if (!data) return null;
  if (!topic) {
    if (!user.isAdmin) return null;
    return (
      <Window title="오늘의 주제" icon={<PixelIcon name="note" size={14} />} className={className}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px]">오늘은 아직 주제가 없어요. 관리자라서 보이는 안내예요.</p>
          <ButtonLink to="/admin" size="sm">
            주제 넣으러 가기
          </ButtonLink>
        </div>
      </Window>
    );
  }

  const mine = topic.entries.find((entry) => entry.isMine);

  return (
    <Window
      title="오늘의 주제"
      icon={<PixelIcon name="note" size={14} />}
      className={className}
      statusBar={
        <>
          <span className="flex-1">
            {topic.entries.length > 0 ? `오늘 ${topic.entries.length}편이 이 주제로 쓰였어요` : '아직 아무도 안 썼어요'}
          </span>
          <Link to="/topics" className="text-inherit">
            지난 주제
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <PixelIcon name="note" size={40} className="hidden sm:block" />
        <div className="min-w-0 flex-1">
          <p className="ink text-[21px] leading-snug">{topic.content}</p>
          <div className="mt-3">
            <TopicEntries members={room.members} entries={topic.entries} />
          </div>
        </div>
        <div className="flex shrink-0 gap-2 sm:flex-col">
          {mine ? (
            <ButtonLink to={`/diaries/${mine.id}`} size="sm">
              내 글 보기
            </ButtonLink>
          ) : (
            <ButtonLink to={`/diaries/new?topic=${topic.id}`} variant="accent" icon={<PenLine size={14} />}>
              이 주제로 쓰기
            </ButtonLink>
          )}
        </div>
      </div>
    </Window>
  );
}
