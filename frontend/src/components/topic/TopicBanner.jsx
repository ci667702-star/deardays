import { Link } from 'react-router';
import { X } from 'lucide-react';
import { formatDiaryDate } from '../../utils/date.js';
import PixelIcon from '../ui/PixelIcon.jsx';

/**
 * 일기에 붙은 '오늘의 주제' 띠. 쓰기 화면에서는 빼기 버튼, 읽기 화면에서는 모아 보기 링크.
 */
export default function TopicBanner({ topic, onRemove, showLink = false }) {
  return (
    <div className="flex items-start gap-2.5 bg-cream px-3 py-2 shadow-[var(--bevel-thin-in)]">
      <PixelIcon name="note" size={24} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="font-small text-[12px] text-muted">{formatDiaryDate(topic.date, { withYear: false })}의 주제</p>
        <p className="ink text-[17px] leading-snug">{topic.content}</p>
      </div>
      {onRemove && (
        <button type="button" className="btn btn--sm shrink-0" onClick={onRemove} title="주제 없이 쓰기">
          <X size={12} aria-hidden="true" /> 주제 빼기
        </button>
      )}
      {showLink && (
        <Link to="/topics" className="btn-tool hidden shrink-0 self-center sm:inline-flex">
          주제 모아 보기
        </Link>
      )}
    </div>
  );
}
