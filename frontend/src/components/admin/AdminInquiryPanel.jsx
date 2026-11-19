import { useState } from 'react';
import { Check, RotateCcw, Send, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { adminService } from '../../services/adminService.js';
import { formatDateTime } from '../../utils/date.js';
import { getErrorMessage } from '../../utils/errors.js';
import { INQUIRY_MAX_LENGTH, categoryLabel } from '../../utils/inquiries.js';
import { cx } from '../../utils/cx.js';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { EmptyState, ErrorMessage, Loading } from '../ui/Feedback.jsx';
import Tabs from '../ui/Tabs.jsx';
import TextField from '../ui/TextField.jsx';

const PAGE = 30;
const MAX_LIMIT = 200; // 서버가 한 번에 주는 최대 개수

/** 문의 하나: 보낸 사람, 내용, 답변 칸, 처리 버튼 */
function InquiryCard({ inquiry, onUpdated, onDelete }) {
  const toast = useToast();
  const [answer, setAnswer] = useState(inquiry.answer ?? '');
  const [busy, setBusy] = useState('');
  const changed = answer.trim() !== (inquiry.answer ?? '');
  const done = inquiry.status === 'done';

  const save = async (kind, body, message) => {
    setBusy(kind);
    try {
      const updated = await adminService.updateInquiry(inquiry.id, body);
      toast.success(message);
      onUpdated(updated);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy('');
    }
  };

  return (
    <li className="flex flex-col gap-3 bg-hilite px-3 py-3 shadow-[var(--bevel-thin-in)] sm:px-4">
      <div className="flex flex-wrap items-center gap-2">
        {inquiry.user ? (
          <span className="flex min-w-0 items-center gap-2">
            <Avatar user={inquiry.user} size={24} />
            <span className="truncate">{inquiry.user.nickname}</span>
            <span className="list-meta truncate">{inquiry.user.email}</span>
          </span>
        ) : (
          <span className="text-muted">(탈퇴한 사람)</span>
        )}
        <span className="flex-1" />
        <span className="chip">{categoryLabel(inquiry.category)}</span>
        <span className={cx('chip', done ? 'chip--today' : 'chip--soon')}>{done ? '처리함' : '확인 전'}</span>
      </div>
      <p className="list-meta">{formatDateTime(inquiry.createdAt)}</p>
      <p className="ink whitespace-pre-wrap break-words text-[15px]">{inquiry.content}</p>

      <TextField
        as="textarea"
        label="답변 (보낸 사람의 내 정보에 보여요)"
        rows={3}
        value={answer}
        maxLength={INQUIRY_MAX_LENGTH}
        inputClassName="ink resize-y text-[15px]"
        placeholder="답변을 쓰지 않고 '처리함'만 눌러도 돼요."
        onChange={(event) => setAnswer(event.target.value)}
        hint={inquiry.answeredAt ? `${formatDateTime(inquiry.answeredAt)}에 답변함` : undefined}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="default"
          icon={<Send size={12} />}
          loading={busy === 'answer'}
          disabled={Boolean(busy) || !answer.trim() || (!changed && done)}
          onClick={() => save('answer', { answer: answer.trim(), status: 'done' }, '답변을 보내고 처리함으로 옮겼어요.')}
        >
          답변 보내고 처리함
        </Button>
        {done ? (
          <Button
            size="sm"
            icon={<RotateCcw size={12} />}
            loading={busy === 'reopen'}
            disabled={Boolean(busy)}
            onClick={() => save('reopen', { status: 'open' }, '확인 전으로 되돌렸어요.')}
          >
            다시 확인 전으로
          </Button>
        ) : (
          <Button
            size="sm"
            icon={<Check size={12} />}
            loading={busy === 'done'}
            disabled={Boolean(busy)}
            onClick={() => save('done', { status: 'done' }, '처리함으로 옮겼어요.')}
          >
            답변 없이 처리함
          </Button>
        )}
        <span className="flex-1" />
        <button type="button" className="btn-tool text-danger" onClick={() => onDelete(inquiry)} disabled={Boolean(busy)} title="문의 지우기">
          <Trash2 size={13} aria-hidden="true" /> 지우기
        </button>
      </div>
    </li>
  );
}

/** 관리자 화면의 '문의함' 탭: 확인 전 / 처리함 / 전체 */
export default function AdminInquiryPanel({ onChange }) {
  const toast = useToast();
  const [status, setStatus] = useState('open');
  const [limit, setLimit] = useState(PAGE);
  const list = useFetch(() => adminService.listInquiries({ status, limit }), [status, limit]);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const counts = list.data?.counts;
  const tabs = [
    { value: 'open', label: `확인 전${counts ? ` ${counts.open}` : ''}` },
    { value: 'done', label: `처리함${counts ? ` ${counts.done}` : ''}` },
    { value: 'all', label: '전체' },
  ];

  const refresh = () => {
    list.reload();
    onChange?.();
  };

  const remove = async () => {
    setDeleteBusy(true);
    try {
      await adminService.deleteInquiry(deleting.id);
      toast.success('문의를 지웠어요.');
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div>
      <p className="mb-3 text-[14px]">사람들이 내 정보 → 문의하기로 보낸 글이에요. 답변을 쓰면 보낸 사람의 내 정보에 보여요.</p>
      <Tabs
        tabs={tabs}
        value={status}
        onChange={(value) => {
          setStatus(value);
          setLimit(PAGE);
        }}
        label="문의 목록"
      >
        {list.loading && !list.data && <Loading compact label="문의를 불러오는 중..." />}
        {list.error && <ErrorMessage error={list.error} onRetry={list.reload} />}
        {list.data && list.data.items.length === 0 && (
          <EmptyState
            icon="letter"
            title={status === 'open' ? '확인할 문의가 없어요' : '문의가 없어요'}
            description={status === 'open' ? '새 문의가 오면 여기에 쌓여요.' : undefined}
          />
        )}
        {list.data && list.data.items.length > 0 && (
          <ul className="flex flex-col gap-3">
            {list.data.items.map((inquiry) => (
              <InquiryCard key={`${inquiry.id}-${inquiry.updatedAt}`} inquiry={inquiry} onUpdated={refresh} onDelete={setDeleting} />
            ))}
          </ul>
        )}
        {list.data?.hasMore && limit < MAX_LIMIT && (
          <div className="mt-3 flex justify-center">
            <Button onClick={() => setLimit((value) => Math.min(value + PAGE, MAX_LIMIT))} loading={list.loading}>
              더 보기
            </Button>
          </div>
        )}
      </Tabs>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="문의 지우기"
        message="이 문의를 지울까요?"
        detail="보낸 사람의 내 정보에서도 사라지고, 되돌릴 수 없어요."
        confirmLabel="지우기"
        danger
        loading={deleteBusy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
