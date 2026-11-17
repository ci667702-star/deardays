import { useState } from 'react';
import { DoorOpen, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRooms } from '../../context/RoomContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { roomService } from '../../services/roomService.js';
import { getErrorMessage } from '../../utils/errors.js';
import Button from '../ui/Button.jsx';
import Tabs from '../ui/Tabs.jsx';
import TextField from '../ui/TextField.jsx';

const CODE_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/;
const normalize = (value) => value.replace(/[\s-]/g, '').toUpperCase();

/** [새 공간 만들기] / [초대 코드로 참여] 탭. 성공하면 그 공간을 현재 공간으로 고른다. */
export default function RoomSetupForm({ onDone, defaultTab = 'create' }) {
  const { user } = useAuth();
  const { upsertRoom, selectRoom } = useRooms();
  const toast = useToast();
  const [tab, setTab] = useState(defaultTab);
  const [name, setName] = useState('우리의 교환일기');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const finish = (room) => {
    upsertRoom(room);
    selectRoom(room.id);
    onDone?.(room);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError('공간 이름을 입력해 주세요.');
    setLoading(true);
    setError('');
    try {
      const room = await roomService.create(trimmed);
      toast.success('공간을 만들었어요. 초대 코드를 친구에게 보내 주세요.');
      finish(room);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (event) => {
    event.preventDefault();
    const normalized = normalize(code);
    if (!normalized) return setError('친구에게 받은 초대 코드를 입력해 주세요.');
    if (!CODE_PATTERN.test(normalized)) return setError('초대 코드는 영문 대문자와 숫자 8자리예요. (예: ABCD-2345)');
    setLoading(true);
    setError('');
    try {
      const room = await roomService.join(normalized);
      const partner = room.members.find((m) => m.id !== user?.id);
      toast.success(`'${room.name}'에 참여했어요. ${partner ? `${partner.nickname}님과 ` : ''}함께 써 봐요!`);
      finish(room);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (value) => {
    setTab(value);
    setError('');
  };

  return (
    <Tabs
      label="공유 공간 시작 방법"
      value={tab}
      onChange={switchTab}
      tabs={[
        { value: 'create', label: '새 공간 만들기' },
        { value: 'join', label: '초대 코드로 참여' },
      ]}
    >
      {tab === 'create' ? (
        <form onSubmit={handleCreate} className="flex flex-col gap-4" noValidate>
          <p className="font-small text-[12px] text-muted">
            공간을 만들면 초대 코드가 생겨요. 친구가 그 코드를 입력하면 둘만의 일기장이 열립니다.
          </p>
          <TextField
            label="공간 이름"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            error={error}
            autoComplete="off"
          />
          <div className="flex justify-end">
            <Button type="submit" variant="default" loading={loading} icon={<Plus size={14} />}>
              공간 만들기
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="flex flex-col gap-4" noValidate>
          <p className="font-small text-[12px] text-muted">
            친구가 보내 준 8자리 코드를 입력하세요. 한 공간에는 두 사람까지만 함께할 수 있어요.
          </p>
          <TextField
            label="초대 코드"
            value={code}
            maxLength={11}
            placeholder="ABCD-2345"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            error={error}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            inputClassName="tracking-[0.2em]"
          />
          <div className="flex justify-end">
            <Button type="submit" variant="default" loading={loading} icon={<DoorOpen size={14} />}>
              참여하기
            </Button>
          </div>
        </form>
      )}
    </Tabs>
  );
}
