import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, DoorOpen, FolderPlus, PenLine, Settings } from 'lucide-react';
import DiaryList from '../components/diary/DiaryList.jsx';
import InviteCodeBox from '../components/room/InviteCodeBox.jsx';
import MemberPair from '../components/room/MemberPair.jsx';
import RoomGate from '../components/room/RoomGate.jsx';
import RoomSetupForm from '../components/room/RoomSetupForm.jsx';
import Button, { ButtonLink } from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Dialog from '../components/ui/Dialog.jsx';
import { EmptyState, ErrorMessage, Loading } from '../components/ui/Feedback.jsx';
import GroupBox from '../components/ui/GroupBox.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import TextField from '../components/ui/TextField.jsx';
import Window from '../components/ui/Window.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useRooms } from '../context/RoomContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus.js';
import { diaryService } from '../services/diaryService.js';
import { roomService } from '../services/roomService.js';
import { formatDateTime } from '../utils/date.js';
import { getErrorMessage } from '../utils/errors.js';
import { prefs } from '../utils/storage.js';

const PAGE_SIZE = 10;

export default function RoomPage() {
  useDocumentTitle('우리 일기장');
  return (
    <RoomGate>
      <RoomView />
    </RoomGate>
  );
}

/** 일기 목록: 정렬을 바꾸면 처음부터, '더 보기'는 다음 페이지를 이어 붙인다 */
function useDiaryPages(roomId, sort) {
  const [state, setState] = useState({ items: [], total: 0, hasMore: false, page: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(
    async (page) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      try {
        const res = await diaryService.list({ roomId, sort, page, limit: PAGE_SIZE });
        if (id !== requestId.current) return;
        setState((prev) => ({
          items: page === 1 ? res.items : [...prev.items, ...res.items],
          total: res.total,
          hasMore: res.hasMore,
          page: res.page,
        }));
      } catch (err) {
        if (id === requestId.current) setError(err);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [roomId, sort],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  return { ...state, loading, error, loadMore: () => load(state.page + 1), reload: () => load(1) };
}

function RoomView() {
  const { user } = useAuth();
  const { rooms, currentRoom, selectRoom, upsertRoom, removeRoom, refreshRoom } = useRooms();
  const toast = useToast();
  const navigate = useNavigate();
  const room = currentRoom;

  const [sort, setSort] = useState(() => (prefs.get('sort') === 'oldest' ? 'oldest' : 'latest'));
  const list = useDiaryPages(room.id, sort);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newRoomOpen, setNewRoomOpen] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    refreshRoom(room.id).catch(() => {});
  }, [room.id, refreshRoom]);

  useRefreshOnFocus(() => {
    refreshRoom(room.id).catch(() => {});
    list.reload();
  });

  const changeSort = (value) => {
    setSort(value);
    prefs.set('sort', value);
  };

  const regenerate = async () => {
    setRegenerating(true);
    try {
      const updated = await roomService.regenerateInviteCode(room.id);
      upsertRoom(updated);
      toast.success('새 초대 코드를 만들었어요. 예전 코드는 더 이상 쓸 수 없어요.');
      setConfirmRegenerate(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRegenerating(false);
    }
  };

  const full = room.members.length >= 2;

  return (
    <>
      <Window
        title={`${room.name} - 우리 일기장`}
        icon={<PixelIcon name="book" size={14} />}
        onClose={() => navigate('/')}
        closeLabel="홈으로"
        toolbar={
          <>
            <Link to="/diaries/new" className="btn-tool">
              <PenLine size={14} /> 새 일기
            </Link>
            <span className="mx-1 h-6 w-[2px] shadow-[inset_1px_0_var(--color-shade),inset_-1px_0_var(--color-hilite)]" aria-hidden="true" />
            <div role="group" aria-label="정렬" className="flex">
              <button type="button" className="btn-tool" aria-pressed={sort === 'latest'} onClick={() => changeSort('latest')}>
                <ArrowDownWideNarrow size={14} /> 최신순
              </button>
              <button type="button" className="btn-tool" aria-pressed={sort === 'oldest'} onClick={() => changeSort('oldest')}>
                <ArrowUpNarrowWide size={14} /> 과거순
              </button>
            </div>
            <span className="mx-1 h-6 w-[2px] shadow-[inset_1px_0_var(--color-shade),inset_-1px_0_var(--color-hilite)]" aria-hidden="true" />
            <button type="button" className="btn-tool" onClick={() => setSettingsOpen(true)}>
              <Settings size={14} /> 공간 설정
            </button>
            <button type="button" className="btn-tool" onClick={() => setNewRoomOpen(true)}>
              <FolderPlus size={14} /> 다른 공간
            </button>
            {rooms.length > 1 && (
              <label className="ml-auto flex items-center gap-2 text-[12px] font-small">
                <span className="hidden sm:inline">보고 있는 공간</span>
                <select
                  className="field min-h-[30px] w-auto py-1 text-[15px] font-ui"
                  value={room.id}
                  onChange={(e) => selectRoom(Number(e.target.value))}
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        }
        statusBar={
          <>
            <span className="flex-1">일기 {list.total}편</span>
            <span>함께하는 사람 {room.members.length}/2</span>
            <span className="hidden sm:block">{formatDateTime(room.createdAt)} 시작</span>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <GroupBox title="함께 쓰는 사람">
            <MemberPair
              members={room.members}
              meId={user.id}
              detailed
              emptySeat={<p className="font-small text-[12px] text-muted">아직 비어 있어요</p>}
            />
          </GroupBox>
          <GroupBox title="초대 코드">
            <div className="flex h-full flex-col gap-3">
              <p className="font-small text-[12px] text-muted">
                {full
                  ? '두 사람이 모두 모였어요. 이 공간에는 더 참여할 수 없어요.'
                  : '친구에게 이 코드를 보내 주세요. 코드를 입력하면 바로 이 공간에 들어와요.'}
              </p>
              <InviteCodeBox code={room.inviteCode} onRegenerate={() => setConfirmRegenerate(true)} />
            </div>
          </GroupBox>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-baseline justify-between">
            <h3>일기 목록</h3>
            <span className="font-small text-[12px] text-muted">{sort === 'latest' ? '최근 날짜부터' : '오래된 날짜부터'}</span>
          </div>

          {list.error && <ErrorMessage error={list.error} onRetry={list.reload} />}
          {list.loading && list.items.length === 0 && <Loading label="일기를 불러오는 중..." />}
          {!list.loading && !list.error && list.items.length === 0 && (
            <div className="sunken">
              <EmptyState
                icon="book"
                title="이 공간에는 아직 일기가 없어요"
                description="오늘 있었던 일을 하나 적어 보세요. 친구가 공감과 댓글로 답해 줄 거예요."
                action={
                  <ButtonLink to="/diaries/new" variant="default" icon={<PenLine size={14} />}>
                    일기 쓰기
                  </ButtonLink>
                }
              />
            </div>
          )}
          {list.items.length > 0 && <DiaryList diaries={list.items} />}
          {list.hasMore && (
            <div className="mt-3 flex justify-center">
              <Button onClick={list.loadMore} loading={list.loading}>
                더 보기 ({list.items.length}/{list.total})
              </Button>
            </div>
          )}
        </div>
      </Window>

      <RoomSettingsDialog
        open={settingsOpen}
        room={room}
        onClose={() => setSettingsOpen(false)}
        onRenamed={(updated) => upsertRoom(updated)}
        onLeft={(roomDeleted) => {
          setSettingsOpen(false);
          removeRoom(room.id);
          toast.info(roomDeleted ? `'${room.name}' 공간과 일기를 모두 정리했어요.` : `'${room.name}'에서 나왔어요.`);
          navigate('/');
        }}
      />

      <Dialog
        open={newRoomOpen}
        title="다른 공유 공간"
        icon={<PixelIcon name="folder" size={14} />}
        onClose={() => setNewRoomOpen(false)}
        width={480}
      >
        <p className="font-small mb-3 text-[12px] text-muted">
          다른 친구와도 따로 일기장을 만들 수 있어요. 만들거나 참여한 공간으로 바로 이동해요.
        </p>
        <RoomSetupForm onDone={() => setNewRoomOpen(false)} />
      </Dialog>

      <ConfirmDialog
        open={confirmRegenerate}
        title="초대 코드 다시 만들기"
        message="새 초대 코드를 만들까요?"
        detail="지금 코드는 바로 쓸 수 없게 돼요. 아직 들어오지 않은 친구에게는 새 코드를 보내 주세요."
        confirmLabel="새로 만들기"
        loading={regenerating}
        onConfirm={regenerate}
        onCancel={() => setConfirmRegenerate(false)}
      />
    </>
  );
}

function RoomSettingsDialog({ open, room, onClose, onRenamed, onLeft }) {
  const toast = useToast();
  const [name, setName] = useState(room.name);
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const alone = room.members.length <= 1;

  useEffect(() => {
    if (open) {
      setName(room.name);
      setNameError('');
    }
  }, [open, room.name]);

  const rename = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setNameError('공간 이름을 입력해 주세요.');
    setSaving(true);
    try {
      const updated = await roomService.rename(room.id, trimmed);
      onRenamed(updated);
      toast.success('공간 이름을 바꿨어요.');
      onClose();
    } catch (error) {
      setNameError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const leave = async () => {
    setLeaving(true);
    try {
      const { roomDeleted } = await roomService.leave(room.id);
      setConfirmLeave(false);
      onLeft(roomDeleted);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setLeaving(false);
    }
  };

  return (
    <>
      <Dialog open={open && !confirmLeave} title="공간 설정" icon={<Settings size={13} />} onClose={onClose} width={460}>
        <form onSubmit={rename} noValidate className="flex flex-col gap-3">
          <TextField
            label="공간 이름"
            value={name}
            maxLength={40}
            onChange={(e) => {
              setName(e.target.value);
              setNameError('');
            }}
            error={nameError}
          />
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="default" loading={saving}>
              이름 저장
            </Button>
          </div>
        </form>
        <hr className="etched my-4" />
        <div className="flex flex-col gap-2">
          <p>공간 나가기</p>
          <p className="font-small text-[12px] text-muted">
            {alone
              ? '혼자 남은 공간이라 나가면 공간과 모든 일기, 사진이 삭제돼요.'
              : '나가면 이 공간의 일기를 더 이상 볼 수 없어요. 내가 쓴 일기는 친구 쪽에 추억으로 남아요.'}
          </p>
          <Button variant="danger" className="self-start" onClick={() => setConfirmLeave(true)} icon={<DoorOpen size={14} />}>
            공간 나가기
          </Button>
        </div>
      </Dialog>
      <ConfirmDialog
        open={confirmLeave}
        title="공간 나가기"
        message={`'${room.name}'에서 나갈까요?`}
        detail={
          alone
            ? '마지막 멤버라서 공간과 모든 일기·사진이 영구 삭제돼요. 되돌릴 수 없어요.'
            : '다시 들어오려면 친구에게 새 초대 코드를 받아야 해요.'
        }
        confirmLabel={alone ? '삭제하고 나가기' : '나가기'}
        danger
        loading={leaving}
        onConfirm={leave}
        onCancel={() => setConfirmLeave(false)}
      />
    </>
  );
}
