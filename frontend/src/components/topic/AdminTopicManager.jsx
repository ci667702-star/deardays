import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { adminService } from '../../services/adminService.js';
import { formatDiaryDate, formatShortDate, isValidDateString } from '../../utils/date.js';
import { getErrorMessage } from '../../utils/errors.js';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { EmptyState, ErrorMessage, Loading } from '../ui/Feedback.jsx';
import GroupBox from '../ui/GroupBox.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';
import Tabs from '../ui/Tabs.jsx';
import TextField from '../ui/TextField.jsx';

const MAX_LENGTH = 200;
const MAX_LINES = 100;

const SCOPES = [
  { value: 'upcoming', label: '오늘과 앞으로' },
  { value: 'past', label: '지난 주제' },
];

function TopicRow({ topic, today, onSaved, onDelete }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ content: topic.content, date: topic.date });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (event) => {
    event.preventDefault();
    const content = form.content.trim();
    if (!content) return setError('주제를 입력해 주세요.');
    if (!isValidDateString(form.date)) return setError('날짜를 골라 주세요.');
    setSaving(true);
    setError('');
    try {
      await adminService.updateTopic(topic.id, { content, date: form.date });
      toast.success('주제를 고쳤어요.');
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <li className="bg-cream px-2 py-2 shadow-[var(--bevel-thin-in)]">
        <form onSubmit={save} className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-start" noValidate>
          <TextField
            type="date"
            aria-label="날짜"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            min="2000-01-01"
            max="2100-12-31"
          />
          <TextField
            aria-label="주제"
            value={form.content}
            maxLength={MAX_LENGTH}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            error={error}
            autoFocus
          />
          <div className="flex gap-1">
            <Button type="submit" size="sm" variant="default" loading={saving}>
              저장
            </Button>
            <Button size="sm" onClick={() => setEditing(false)} disabled={saving}>
              취소
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-light px-2 py-2 last:border-b-0 sm:grid-cols-[110px_minmax(0,1fr)_70px_auto]">
      <span className="list-meta flex items-center gap-1.5">
        {formatShortDate(topic.date)}
        {topic.date === today && <span className="chip chip--today">오늘</span>}
        {topic.isAuto && (
          <span className="chip" title="관리자가 넣지 않아 글감 목록에서 자동으로 고른 주제">
            자동
          </span>
        )}
      </span>
      <span className="ink col-span-2 row-start-2 min-w-0 break-keep text-[15px] sm:col-span-1 sm:row-start-auto">{topic.content}</span>
      <span className="list-meta hidden sm:block">글 {topic.diaryCount}편</span>
      <span className="col-start-2 row-start-1 flex gap-1 sm:col-start-auto sm:row-start-auto">
        <button type="button" className="btn-tool" onClick={() => setEditing(true)} title="고치기">
          <Pencil size={13} aria-hidden="true" />
          <span className="sr-only">{formatDiaryDate(topic.date, { withWeekday: false })} 주제 고치기</span>
        </button>
        <button type="button" className="btn-tool text-danger" onClick={() => onDelete(topic)} title="지우기">
          <Trash2 size={13} aria-hidden="true" />
          <span className="sr-only">{formatDiaryDate(topic.date, { withWeekday: false })} 주제 지우기</span>
        </button>
      </span>
    </li>
  );
}

/** 관리자 화면의 '오늘의 주제' 탭: 하루 하나 글쓰기 주제 넣기·고치기·지우기 */
export default function AdminTopicManager({ onChange }) {
  const toast = useToast();
  const [scope, setScope] = useState('upcoming');
  const list = useFetch(() => adminService.listTopics({ scope, limit: 100 }), [scope]);
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const multi = lines.length > 1;
  const nextDate = list.data?.nextEmptyDate;

  const add = async (event) => {
    event.preventDefault();
    if (lines.length === 0) return setError('넣을 주제를 입력해 주세요.');
    if (lines.length > MAX_LINES) return setError(`한 번에 ${MAX_LINES}개까지 넣을 수 있어요.`);
    const tooLong = lines.findIndex((line) => line.length > MAX_LENGTH);
    if (tooLong !== -1) return setError(`${tooLong + 1}번째 줄이 ${MAX_LENGTH}자를 넘어요.`);
    if (!multi && date && !isValidDateString(date)) return setError('날짜를 다시 골라 주세요.');

    setAdding(true);
    setError('');
    try {
      if (multi) {
        const created = await adminService.createTopics(lines);
        const first = created[0]?.date;
        const last = created[created.length - 1]?.date;
        toast.success(`주제 ${created.length}개를 ${formatShortDate(first)}부터 ${formatShortDate(last)}까지 넣었어요.`);
      } else {
        const created = await adminService.createTopic({ content: lines[0], date });
        toast.success(`${formatDiaryDate(created.date, { withYear: false })}의 주제를 넣었어요.`);
      }
      setText('');
      setDate('');
      list.reload();
      onChange?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await adminService.deleteTopic(deleting.id);
      toast.success('주제를 지웠어요.');
      setDeleting(null);
      list.reload();
      onChange?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  };

  let hint = '';
  if (multi) hint = `${lines.length}개를 ${nextDate ? formatShortDate(nextDate) : '오늘'}부터 비어 있는 날짜에 차례로 넣어요.`;
  else if (!date && nextDate) hint = `날짜를 비우면 다음 빈 날짜(${formatShortDate(nextDate)})에 들어가요.`;

  return (
    <div>
      <div>
        <p className="mb-3 text-[14px]">
          날마다 하나씩 열리는 글쓰기 주제예요. 주제를 넣지 않은 날은 글감 목록에서 자동으로 하나가 열려요.
        </p>
        <form onSubmit={add} noValidate>
          <GroupBox title="주제 넣기" className="flex flex-col gap-3">
          <TextField
            as="textarea"
            label="주제 (한 줄에 하나)"
            rows={4}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError('');
            }}
            placeholder={'요즘 제일 자주 듣는 노래는?\n어릴 때 꿈은 뭐였어?\n올해 가장 잘한 일 하나'}
            error={error}
            hint={error ? undefined : hint}
          />
          <div className="flex flex-wrap items-end gap-2">
            <TextField
              label="날짜 (한 개 넣을 때만)"
              type="date"
              value={multi ? '' : date}
              onChange={(e) => setDate(e.target.value)}
              disabled={multi}
              min="2000-01-01"
              max="2100-12-31"
              className="w-[180px]"
            />
            <Button type="submit" variant="default" loading={adding} icon={<Plus size={14} />}>
              {multi ? `${lines.length}개 넣기` : '넣기'}
            </Button>
          </div>
          </GroupBox>
        </form>

        <div className="mt-4">
          <Tabs tabs={SCOPES} value={scope} onChange={setScope} label="주제 목록">
            {list.loading && !list.data && <Loading compact label="주제를 불러오는 중..." />}
            {list.error && <ErrorMessage error={list.error} onRetry={list.reload} />}
            {list.data && list.data.items.length === 0 && (
              <EmptyState
                icon="note"
                title={scope === 'upcoming' ? '앞으로 나올 주제가 없어요' : '지난 주제가 없어요'}
                description={scope === 'upcoming' ? '위 칸에 주제를 한 줄에 하나씩 넣어 보세요.' : undefined}
              />
            )}
            {list.data && list.data.items.length > 0 && (
              <ul className="sunken max-h-[420px] overflow-auto bg-hilite">
                {list.data.items.map((topic) => (
                  <TopicRow
                    key={topic.id}
                    topic={topic}
                    today={list.data.today}
                    onSaved={() => {
                      list.reload();
                      onChange?.();
                    }}
                    onDelete={setDeleting}
                  />
                ))}
              </ul>
            )}
            {list.data && (
              <p className="mt-2 text-[12px] text-muted">
                {scope === 'upcoming' ? '오늘과 앞으로' : '지난 주제'} {list.data.total}개
              </p>
            )}
          </Tabs>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="주제 지우기"
        message={deleting ? `${formatDiaryDate(deleting.date, { withYear: false })}의 주제를 지울까요?` : ''}
        detail={
          deleting?.diaryCount
            ? `이 주제로 쓴 일기 ${deleting.diaryCount}편은 남고, 주제 표시만 사라져요.`
            : '이 주제로 쓴 일기는 아직 없어요.'
        }
        confirmLabel="지우기"
        danger
        loading={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
