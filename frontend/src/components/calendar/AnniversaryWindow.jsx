import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { announceAnniversariesChanged } from '../../hooks/useAnniversaries.js';
import { anniversaryService } from '../../services/anniversaryService.js';
import { ddayLabel } from '../../utils/anniversaries.js';
import { formatDiaryDate, isValidDateString, todayString } from '../../utils/date.js';
import { getErrorMessage } from '../../utils/errors.js';
import { cx } from '../../utils/cx.js';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { EmptyState, ErrorMessage, Loading } from '../ui/Feedback.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';
import TextField from '../ui/TextField.jsx';
import Window from '../ui/Window.jsx';

const EMPTY = { title: '', date: '', yearly: false };

/** 기념일 넣기·고치기 폼 */
function AnniversaryForm({ initial = EMPTY, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial, date: initial.date || todayString() });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return setError('기념일 이름을 입력해 주세요. (예: 별이 생일)');
    if (!isValidDateString(form.date)) return setError('날짜를 골라 주세요.');
    setSaving(true);
    setError('');
    try {
      await onSubmit({ title: form.title.trim(), date: form.date, yearly: form.yearly });
      setForm({ ...EMPTY, date: todayString() });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2" noValidate>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px]">
        <TextField
          label="이름"
          value={form.title}
          maxLength={40}
          placeholder="별이 생일, 기말고사, 제주 여행..."
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          error={error}
        />
        <TextField label="날짜" type="date" value={form.date} min="1900-01-01" max="2100-12-31" onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="check text-[13px]">
          <input type="checkbox" checked={form.yearly} onChange={(e) => setForm((f) => ({ ...f, yearly: e.target.checked }))} />
          <span>해마다 반복 (생일·기념일)</span>
        </label>
        <div className="flex gap-1">
          <Button type="submit" size="sm" variant="default" loading={saving} icon={!onCancel && <Plus size={12} />}>
            {submitLabel}
          </Button>
          {onCancel && (
            <Button size="sm" onClick={onCancel} disabled={saving}>
              취소
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

function AnniversaryRow({ item, onSaved, onDelete }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="bg-cream px-2 py-2 shadow-[var(--bevel-thin-in)]">
        <AnniversaryForm
          initial={item}
          submitLabel="저장"
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => {
            await anniversaryService.update(item.id, data);
            toast.success('기념일을 고쳤어요.');
            setEditing(false);
            announceAnniversariesChanged();
          }}
        />
      </li>
    );
  }

  const past = item.dday < 0;
  return (
    <li className={cx('flex items-center gap-2 border-b border-light px-1 py-1.5 last:border-b-0', past && 'opacity-70')}>
      <span
        className={cx(
          'font-small w-[58px] shrink-0 py-0.5 text-center text-[12px] font-bold',
          item.dday === 0 ? 'bg-select text-select-text' : past ? 'text-muted' : 'bg-pink-soft text-ink shadow-[var(--bevel-thin-in)]',
        )}
      >
        {ddayLabel(item.dday)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="ink block truncate text-[15px]">{item.title}</span>
        <span className="list-meta block">
          {formatDiaryDate(item.nextDate, { withYear: !item.yearly })}
          {item.yearly && item.years > 0 && ` · ${item.years}번째`}
          {` · ${item.creator?.nickname ?? ''}`}
        </span>
      </span>
      {item.isMine && (
        <span className="flex shrink-0 gap-0.5">
          <button type="button" className="btn-tool" onClick={() => setEditing(true)} title="고치기">
            <Pencil size={13} aria-hidden="true" />
            <span className="sr-only">{item.title} 고치기</span>
          </button>
          <button type="button" className="btn-tool text-danger" onClick={() => onDelete(item)} title="지우기">
            <Trash2 size={13} aria-hidden="true" />
            <span className="sr-only">{item.title} 지우기</span>
          </button>
        </span>
      )}
    </li>
  );
}

/** 달력 화면의 '기념일' 창: 다가오는 D-day 목록 + 넣기 */
export default function AnniversaryWindow({ roomId, anniversaries }) {
  const toast = useToast();
  const { data: items, loading, error, reload } = anniversaries;
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await anniversaryService.remove(deleting.id);
      toast.success('기념일을 지웠어요.');
      setDeleting(null);
      announceAnniversariesChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Window
      title="기념일"
      icon={<PixelIcon name="cake" size={14} />}
      statusBar={<span className="flex-1">함께 보는 기념일 {items?.length ?? 0}개</span>}
    >
      {loading && !items && <Loading compact label="기념일을 불러오는 중..." />}
      {error && <ErrorMessage error={error} onRetry={reload} />}
      {items && items.length === 0 && (
        <EmptyState icon="cake" title="아직 기념일이 없어요" description="생일, 시험, 여행 날짜를 넣으면 달력에 표시되고 D-day를 세어 줘요." />
      )}
      {items && items.length > 0 && (
        <ul className="sunken mb-3 max-h-[280px] overflow-auto bg-hilite px-1">
          {items.map((item) => (
            <AnniversaryRow key={item.id} item={item} onSaved={reload} onDelete={setDeleting} />
          ))}
        </ul>
      )}
      <AnniversaryForm
        submitLabel="넣기"
        onSubmit={async (data) => {
          await anniversaryService.create(roomId, data);
          toast.success('기념일을 넣었어요. 공간 사람 모두에게 보여요.');
          announceAnniversariesChanged();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="기념일 지우기"
        message={deleting ? `'${deleting.title}'을(를) 지울까요?` : ''}
        detail="공간 사람 모두의 달력에서 사라져요."
        confirmLabel="지우기"
        danger
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </Window>
  );
}
