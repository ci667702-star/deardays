import { Link } from 'react-router';
import { Heart, ImageIcon, MessageSquare } from 'lucide-react';
import { formatShortDate } from '../../utils/date.js';
import Avatar from '../ui/Avatar.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';

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

/** 탐색기 '자세히 보기' 같은 일기 목록. 넓은 화면에선 열, 좁은 화면에선 두 줄로. */
export default function DiaryList({ diaries, showHeader = true }) {
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
                <span className="block truncate">{diary.title}</span>
                <span className="ink block truncate text-[13px] opacity-70">{diary.content.slice(0, 80)}</span>
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
