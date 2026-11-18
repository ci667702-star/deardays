import { formatDateTime } from '../../utils/date.js';
import { cx } from '../../utils/cx.js';
import { MAX_ROOM_MEMBERS } from '../../utils/rooms.js';
import Avatar from '../ui/Avatar.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';

function MemberCard({ member, isMe, detailed, small = false }) {
  const size = small ? (detailed ? 52 : 40) : detailed ? 72 : 56;
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <Avatar user={member} size={size} />
      <div className="w-full min-w-0">
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

function EmptySeat({ detailed, small = false, label = '친구 자리', children }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <span
        className={cx(
          'grid place-items-center border-2 border-dashed border-shade text-shade',
          small ? (detailed ? 'size-[52px]' : 'size-10') : detailed ? 'size-[72px]' : 'size-14',
        )}
        aria-hidden="true"
      >
        ?
      </span>
      <p className="text-muted">{label}</p>
      {children}
    </div>
  );
}

/**
 * 공간 사람들. 둘이면 '나 ♥ 친구', 셋 이상이면 바둑판으로 (최대 6명).
 * 아직 혼자면 빈자리를 보여 준다.
 */
export default function MemberPair({ members, meId, detailed = false, emptySeat }) {
  const me = members.find((m) => m.id === meId);
  const others = members.filter((m) => m.id !== meId);

  if (others.length <= 1) {
    const partner = others[0];
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

  const left = MAX_ROOM_MEMBERS - members.length;
  return (
    <ul className="grid grid-cols-3 gap-x-2 gap-y-4" aria-label={`함께 쓰는 사람 ${members.length}명`}>
      {[me, ...others].filter(Boolean).map((member) => (
        <li key={member.id} className="flex min-w-0">
          <MemberCard member={member} isMe={member.id === meId} detailed={detailed} small />
        </li>
      ))}
      {left > 0 && (
        <li className="flex min-w-0">
          <EmptySeat detailed={detailed} small label={`빈자리 ${left}`} />
        </li>
      )}
    </ul>
  );
}
