import { Link } from 'react-router';
import { Heart, ImageIcon, MessageSquare } from 'lucide-react';
import { formatShortDate } from '../../utils/date.js';
import Avatar from '../ui/Avatar.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';
import { MoodWeatherBadge } from './MoodWeather.jsx';

// 내 일기는 분홍 봉인, 친구 일기는 라벤더 봉인
export const PARTNER_SEAL = { p: '#a593dc', P: '#7a68bd' };

function Counts({ diary }) {
  return (
    <span className="list-meta flex items-center gap-2.5">
      <span className="inline-flex items-center gap-1" title={`공감 ${diary.likeCount}`}>
        <Heart size={12} className={diary.likedByMe ? 'fill-pink text-pink' : ''} aria-hidden="true" />
        <span className="sr-only">공감</span>
        {diary.likeCount}
      </span>
      <span className="inline-flex items-center gap-1" title={`댓글 ${diary.commentCount}`}>
        <MessageSquare size={12} aria-hidden="true" />
        <span className="sr-only">댓글</span>
        {diary.commentCount}
      </span>
      {diary.images.length > 0 && (
        <span className="inline-flex items-center gap-1" title={`사진 ${diary.images.length}장`}>
          <ImageIcon size={12} aria-hidden="true" />
          <span className="sr-only">사진</span>
          {diary.images.length}
        </span>
      )}
    </span>
  );
}

/** 찾은 낱말을 <mark> 로 강조한다 (대소문자 무시) */
function Highlight({ text, word }) {
  if (!word) return text;
  const lower = text.toLowerCase();
  const needle = word.toLowerCase();
  const parts = [];
  let from = 0;
  let index = lower.indexOf(needle);
  while (index !== -1) {
    if (index > from) parts.push(text.slice(from, index));
    parts.push(
      <mark key={index} className="bg-cream px-0.5 text-ink shadow-[inset_0_-2px_var(--color-pink)]">
        {text.slice(index, index + word.length)}
      </mark>,
    );
    from = index + word.length;
    index = lower.indexOf(needle, from);
  }
  if (from < text.length) parts.push(text.slice(from));
  return parts;
}

/** 본문 미리보기: 찾는 낱말이 있으면 그 주변을 보여 준다 */
function excerpt(content, word) {
  const flat = content.replace(/\s+/g, ' ');
  if (!word) return flat.slice(0, 80);
  const at = flat.toLowerCase().indexOf(word.toLowerCase());
  if (at <= 30) return flat.slice(0, 80);
  return `…${flat.slice(at - 25, at + 55)}`;
}

/**
 * 탐색기 '자세히 보기' 같은 일기 목록. 넓은 화면에선 열, 좁은 화면에선 두 줄로.
 * highlight: 검색 결과에서 강조할 낱말
 */
export default function DiaryList({ diaries, showHeader = true, highlight = '' }) {
  return (
    <div className="sunken @container">
      {showHeader && (
        <div
          className="hidden grid-cols-[28px_minmax(0,1fr)_130px_92px_120px] gap-[10px] bg-face px-2 py-1 text-[12px] @2xl:grid"
          aria-hidden="true"
        >
          <span />
          <span className="font-small">제목</span>
          <span className="font-small">쓴 사람</span>
          <span className="font-small">날짜</span>
          <span className="font-small">반응</span>
        </div>
      )}
      <ul>
        {diaries.map((diary) => (
          <li key={diary.id}>
            <Link
              to={`/diaries/${diary.id}`}
              className="list-row grid-cols-[28px_minmax(0,1fr)] @2xl:grid-cols-[28px_minmax(0,1fr)_130px_92px_120px]"
            >
              <PixelIcon name="letter" size={24} palette={diary.isMine ? undefined : PARTNER_SEAL} />
              <span className="min-w-0">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate">
                    <Highlight text={diary.title} word={highlight} />
                  </span>
                  <MoodWeatherBadge mood={diary.mood} weather={diary.weather} compact />
                </span>
                <span className="ink block truncate text-[13px] opacity-70">
                  <Highlight text={excerpt(diary.content, highlight)} word={highlight} />
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 @2xl:hidden">
                  <span className="list-meta inline-flex items-center gap-1.5">
                    <Avatar user={diary.author} size={16} />
                    {diary.author.nickname}
                  </span>
                  <span className="list-meta">{formatShortDate(diary.diaryDate)}</span>
                  <Counts diary={diary} />
                </span>
              </span>
              <span className="hidden min-w-0 items-center gap-2 @2xl:flex">
                <Avatar user={diary.author} size={20} />
                <span className="truncate text-[13px]">{diary.author.nickname}</span>
              </span>
              <span className="list-meta hidden @2xl:block">{formatShortDate(diary.diaryDate)}</span>
              <span className="hidden @2xl:block">
                <Counts diary={diary} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
