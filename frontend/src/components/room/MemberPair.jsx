import { formatDateTime } from '../../utils/date.js';
import { cx } from '../../utils/cx.js';
import Avatar from '../ui/Avatar.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';

function MemberCard({ member, isMe, detailed }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <Avatar user={member} size={detailed ? 72 : 56} />
      <div className="min-w-0">
        <p className="truncate">
          {member.nickname}
          {isMe && <span className="font-small ml-1 text-[12px] text-muted">(나)</span>}
        </p>
        {detailed && (
          <>
            <p className="ink mt-1 line-clamp-2 text-[14px] text-muted">{member.introduction || '아직 자기소개가 없어요.'}</p>
            <p className="font-small mt-1 text-[12px] text-muted">{formatDateTime(member.joinedAt)} 참여</p>
          </>
        )}
      </div>
    </div>
  );
}

function EmptySeat({ detailed, children }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <span
        className={cx('grid place-items-center border-2 border-dashed border-shade text-shade', detailed ? 'size-[72px]' : 'size-14')}
        aria-hidden="true"
      >
        ?
      </span>
      <p className="text-muted">친구 자리</p>
      {children}
    </div>
  );
}

/** 나 ♥ 친구 */
export default function MemberPair({ members, meId, detailed = false, emptySeat }) {
  const me = members.find((m) => m.id === meId);
  const partner = members.find((m) => m.id !== meId);

  return (
    <div className="flex items-start justify-center gap-3 sm:gap-6">
      {me && <MemberCard member={me} isMe detailed={detailed} />}
      <PixelIcon
        name="heart"
        size={detailed ? 32 : 24}
        className={cx('shrink-0 self-center', !partner && 'opacity-40')}
        palette={partner ? undefined : { p: '#ffffff', P: '#e8dcdc' }}
        title={partner ? '함께 쓰는 중' : '친구를 기다리는 중'}
      />
      {partner ? <MemberCard member={partner} detailed={detailed} /> : <EmptySeat detailed={detailed}>{emptySeat}</EmptySeat>}
    </div>
  );
}
