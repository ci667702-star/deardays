import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Trash2, Undo2 } from 'lucide-react';
import LetterComposer from '../components/letter/LetterComposer.jsx';
import { LETTERBOX_PALETTE } from '../components/layout/navItems.js';
import RoomGate from '../components/room/RoomGate.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Dialog from '../components/ui/Dialog.jsx';
import { EmptyState, ErrorMessage, Loading } from '../components/ui/Feedback.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import Window from '../components/ui/Window.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useRooms } from '../context/RoomContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus.js';
import { letterService } from '../services/letterService.js';
import { daysUntil, formatDiaryDate, formatShortDate, todayString } from '../utils/date.js';
import { cx } from '../utils/cx.js';
import { getErrorMessage } from '../utils/errors.js';

// 봉투 색: 봉인됨(회보라) / 도착해서 아직 안 읽음(분홍) / 읽음(크림)
const SEALED = { c: '#cfc8dc', p: '#7a6f8a' };
const ARRIVED = LETTERBOX_PALETTE;

const TABS = ['received', 'sent', 'write'];

export default function LettersPage() {
  useDocumentTitle('편지함');
  return (
    <RoomGate>
      <LettersView />
    </RoomGate>
  );
}

const nameOf = (person, meId) => (person?.id === meId ? '나' : person?.nickname ?? '알 수 없음');

function receivedStatus(letter) {
  if (letter.sealed) {
    const left = daysUntil(letter.openAt);
    return { text: `${formatShortDate(letter.openAt)}에 열려요 (D-${left})`, tone: '' };
  }
  if (!letter.openedAt) return { text: '도착! 열어 보세요', tone: 'chip--today' };
  return { text: `${formatShortDate(todayString(new Date(letter.openedAt)))}에 읽음`, tone: '' };
}

function sentStatus(letter) {
  if (!letter.openable) return { text: `${formatShortDate(letter.openAt)}에 도착 (D-${daysUntil(letter.openAt)})`, tone: '' };
  if (!letter.openedAt) return { text: '도착함, 아직 안 읽음', tone: 'chip--soon' };
  return { text: `${formatShortDate(todayString(new Date(letter.openedAt)))}에 읽음`, tone: '' };
}

function LettersView() {
  const { user } = useAuth();
  const { currentRoom, partner } = useRooms();
  const toast = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'received';

  const { data, loading, error, reload, setData } = useFetch(() => letterService.list(currentRoom.id), [currentRoom.id]);
  useRefreshOnFocus(reload);

  const [viewing, setViewing] = useState(null);
  const [sealedNotice, setSealedNotice] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const setTab = (value) => {
    const next = new URLSearchParams(params);
    next.set('tab', value);
    next.delete('open');
    setParams(next, { replace: true });
  };

  const openLetter = async (letter) => {
    if (letter.sealed) {
      setSealedNotice(letter);
      return;
    }
    setOpeningId(letter.id);
    try {
      const full = await letterService.get(letter.id);
      setViewing(full);
      // 처음 열었다면 목록에도 '읽음' 반영
      setData((prev) =>
        prev && {
          ...prev,
          received: prev.received.map((item) => (item.id === full.id ? { ...item, openedAt: full.openedAt } : item)),
        },
      );
    } catch (err) {
      if (err.response?.data?.code === 'LETTER_SEALED') setSealedNotice(letter);
      else toast.error(getErrorMessage(err));
    } finally {
      setOpeningId(null);
    }
  };

  // 알림에서 '/letters?open=편지번호' 로 들어오면 그 편지를 바로 연다
  useEffect(() => {
    const openId = Number(params.get('open'));
    if (!openId || !data) return;
    const target = [...data.received, ...data.sent].find((letter) => letter.id === openId);
    const next = new URLSearchParams(params);
    next.delete('open');
    setParams(next, { replace: true });
    if (target) openLetter(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, params]);

  const send = async (payload) => {
    const letter = await letterService.create({ roomId: currentRoom.id, ...payload });
    toast.success(
      letter.openable
        ? `편지를 보냈어요. ${letter.recipient.id === user.id ? '바로' : `${letter.recipient.nickname}님이 바로`} 열어 볼 수 있어요.`
        : `편지를 봉인했어요. ${formatDiaryDate(letter.openAt, { withWeekday: false })}에 열려요.`,
    );
    reload();
    setTab(letter.recipient.id === user.id ? 'received' : 'sent');
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await letterService.remove(deleteTarget.id);
      toast.success(deleteTarget.isSender && !deleteTarget.openedAt ? '편지 보내기를 취소했어요.' : '편지를 지웠어요.');
      setDeleteTarget(null);
      setViewing(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const canDelete = (letter) => (letter.isSender && !letter.openedAt) || (letter.isRecipient && Boolean(letter.openedAt));
  const unopened = data ? data.received.filter((letter) => letter.openable && !letter.openedAt).length : 0;

  const renderList = (letters, kind) => {
    if (letters.length === 0) {
      return kind === 'received' ? (
        <EmptyState
          icon="letter"
          title="받은 편지가 없어요"
          description="친구가 보낸 편지나 미래의 나에게 쓴 편지가 여기에 와요. 여는 날 전에는 봉인된 채로 보여요."
          action={<Button onClick={() => setTab('write')}>편지 쓰기</Button>}
        />
      ) : (
        <EmptyState
          icon="letter"
          title="보낸 편지가 없어요"
          description="친구에게 미래의 어느 날 열리는 편지를 보내 보세요."
          action={<Button onClick={() => setTab('write')}>편지 쓰기</Button>}
        />
      );
    }
    return (
      <ul className="sunken divide-y divide-rule">
        {letters.map((letter) => {
          const status = kind === 'received' ? receivedStatus(letter) : sentStatus(letter);
          const palette = letter.sealed ? SEALED : !letter.openedAt && kind === 'received' ? ARRIVED : undefined;
          const counterpart =
            kind === 'received'
              ? letter.sender.id === user.id
                ? '미래의 나에게 (내가 씀)'
                : `From. ${letter.sender.nickname}`
              : `To. ${nameOf(letter.recipient, user.id)}`;
          return (
            <li key={letter.id} className="flex items-center gap-1 pr-1">
              <button
                type="button"
                onClick={() => openLetter(letter)}
                className="list-row min-w-0 flex-1 grid-cols-[32px_minmax(0,1fr)] text-left"
                aria-busy={openingId === letter.id || undefined}
              >
                <PixelIcon name={openingId === letter.id ? 'hourglass' : 'letter'} size={28} palette={palette} />
                <span className="min-w-0">
                  <span className={cx('block truncate', kind === 'received' && letter.openable && !letter.openedAt && 'font-bold')}>
                    {letter.sealed ? '봉인된 편지' : letter.title}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="list-meta">{counterpart}</span>
                    <span className={cx('chip', status.tone)}>{status.text}</span>
                  </span>
                </span>
              </button>
              {kind === 'sent' && canDelete(letter) && (
                <button type="button" className="btn-tool shrink-0 text-[12px]" onClick={() => setDeleteTarget(letter)}>
                  <Undo2 size={12} />
                  <span className="hidden sm:inline">보내기 취소</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <Window
        title={`편지함 - ${currentRoom.name}`}
        icon={<PixelIcon name="letter" size={14} palette={LETTERBOX_PALETTE} />}
        onClose={() => navigate('/')}
        closeLabel="홈으로"
        statusBar={
          <>
            <span className="flex-1">{data ? `받은 편지 ${data.received.length}통, 보낸 편지 ${data.sent.length}통` : '편지함'}</span>
            <span>새로 도착 {unopened}통</span>
            <span className="hidden sm:block">봉인 중 {data?.counts.sealed ?? 0}통</span>
          </>
        }
      >
        <Tabs
          label="편지함"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'received', label: unopened ? `받은 편지 (${unopened})` : '받은 편지' },
            { value: 'sent', label: '보낸 편지' },
            { value: 'write', label: '편지 쓰기' },
          ]}
        >
          {tab === 'write' ? (
            <LetterComposer me={user} partner={partner} onSend={send} />
          ) : (
            <>
              {loading && !data && <Loading label="편지함을 여는 중..." />}
              {error && <ErrorMessage error={error} onRetry={reload} />}
              {data && renderList(tab === 'received' ? data.received : data.sent, tab)}
            </>
          )}
        </Tabs>
      </Window>

      <Dialog
        open={Boolean(viewing)}
        title={viewing ? `${viewing.title} - 편지` : '편지'}
        icon={<PixelIcon name="letter" size={14} palette={LETTERBOX_PALETTE} />}
        onClose={() => setViewing(null)}
        width={600}
        footer={
          viewing && (
            <>
              {canDelete(viewing) && (
                <Button variant="danger" onClick={() => setDeleteTarget(viewing)} icon={<Trash2 size={14} />}>
                  {viewing.isSender && !viewing.openedAt ? '보내기 취소' : '편지 지우기'}
                </Button>
              )}
              <Button variant="default" onClick={() => setViewing(null)} autoFocus>
                닫기
              </Button>
            </>
          )
        }
      >
        {viewing && (
          <>
            <div className="sunken p-[2px]">
              <div className="paper min-h-[240px]">
                {`To. ${viewing.recipient.id === user.id ? '나' : viewing.recipient.nickname}\n\n${viewing.content}\n\n`}
                <span className="block text-right">From. {viewing.sender.id === user.id ? '나' : viewing.sender.nickname}</span>
              </div>
            </div>
            <p className="hint">
              {formatDiaryDate(todayString(new Date(viewing.createdAt)))}에 쓰고, {formatDiaryDate(viewing.openAt)}에 열리도록 봉인한 편지예요.
            </p>
          </>
        )}
      </Dialog>

      <Dialog
        open={Boolean(sealedNotice)}
        title="봉인된 편지"
        icon={<PixelIcon name="letter" size={14} palette={SEALED} />}
        onClose={() => setSealedNotice(null)}
        width={400}
        footer={
          <Button variant="default" onClick={() => setSealedNotice(null)} autoFocus>
            확인
          </Button>
        }
      >
        {sealedNotice && (
          <div className="flex items-start gap-4">
            <PixelIcon name="hourglass" size={32} />
            <div>
              <p>아직 열 수 없는 편지예요.</p>
              <p className="mt-1 text-[18px]">
                D-{daysUntil(sealedNotice.openAt)} · {formatDiaryDate(sealedNotice.openAt)}
              </p>
              <p className="hint">여는 날이 되면 새 소식으로 알려 드릴게요.</p>
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.isSender && !deleteTarget?.openedAt ? '보내기 취소' : '편지 지우기'}
        message={
          deleteTarget?.isSender && !deleteTarget?.openedAt
            ? '이 편지 보내기를 취소할까요?'
            : '이 편지를 지울까요?'
        }
        detail="지운 편지는 되돌릴 수 없어요."
        confirmLabel={deleteTarget?.isSender && !deleteTarget?.openedAt ? '보내기 취소' : '지우기'}
        cancelLabel="그대로 두기"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
