import { useState } from 'react';
import { Link } from 'react-router';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRooms } from '../../context/RoomContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { daysUntil, todayString } from '../../utils/date.js';
import { getErrorMessage } from '../../utils/errors.js';
import { MAX_ROOM_MEMBERS, groupLabel, namesOf, othersOf } from '../../utils/rooms.js';
import Button from '../ui/Button.jsx';
import Dialog from '../ui/Dialog.jsx';
import GroupBox from '../ui/GroupBox.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';
import InviteCodeBox from './InviteCodeBox.jsx';
import MemberPair from './MemberPair.jsx';

// 홈의 '친구 초대' 버튼(아직 혼자일 때)으로 여는 창

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

/** 친구 초대: 함께한 날 + 함께 쓰는 사람 + (자리가 남았으면) 초대 코드 */
export default function FriendsPopup({ open, onClose }) {
  const { user } = useAuth();
  const { currentRoom: room, refreshRoom } = useRooms();
  const toast = useToast();
  const [checking, setChecking] = useState(false);

  const day = -daysUntil(localDateOf(room.createdAt), todayString()) + 1;
  const next = nextMilestone(day);
  const others = othersOf(room.members, user.id);
  const seatsLeft = MAX_ROOM_MEMBERS - room.members.length;

  const checkFriends = async () => {
    setChecking(true);
    try {
      const updated = await refreshRoom(room.id);
      const joined = othersOf(updated.members, user.id);
      if (joined.length > others.length) toast.success(`${namesOf(joined)}이 함께하고 있어요!`);
      else if (joined.length === 0) toast.info('아직 친구가 들어오지 않았어요.');
      else toast.info('새로 들어온 친구는 없어요.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setChecking(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`친구 - ${groupLabel(room.members.length)}`}
      icon={<PixelIcon name="heart" size={14} />}
      width={480}
    >
      <p className="text-center text-[14px] text-muted">{room.name}</p>
      <p className="text-center text-[26px] leading-tight">함께한 지 {day}일째</p>
      <p className="mt-1 text-center text-[13px] text-muted">
        {next.left === 0 ? `오늘이 ${next.label}이에요!` : `${next.label}까지 D-${next.left}`}
      </p>

      <div className="mt-5">
        <MemberPair
          members={room.members}
          meId={user.id}
          emptySeat={<p className="text-[12px] text-muted">초대 코드를 보내 주세요</p>}
        />
      </div>

      {seatsLeft > 0 && (
        <GroupBox title="친구 초대" className="mt-5">
          <p className="mb-3 text-[13px] text-muted">
            친구가 이 코드를 입력하면 함께 쓸 수 있어요. ({seatsLeft}자리 남음)
          </p>
          <InviteCodeBox code={room.inviteCode} compact />
          <Button size="sm" onClick={checkFriends} loading={checking} icon={<RefreshCw size={12} />} className="mt-3">
            친구가 들어왔는지 확인
          </Button>
        </GroupBox>
      )}

      <p className="mt-4 text-right text-[13px]">
        <Link to="/room" onClick={onClose}>
          일기장에서 자세히 보기
        </Link>
      </p>
    </Dialog>
  );
}
