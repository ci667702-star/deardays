import { useRef, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { isValidDateString } from '../../utils/date.js';
import { getErrorMessage } from '../../utils/errors.js';
import Button from '../ui/Button.jsx';
import TextField from '../ui/TextField.jsx';

const MAX_LENGTH = 200;

/**
 * 할 일 추가·수정 폼: 내용 + 기한(선택) + 맡을 사람(함께/나/친구).
 * initial 이 있으면 수정 모드.
 */
export default function TodoForm({ members, meId, initial, onSubmit, onCancel, autoFocus = false }) {
  const editing = Boolean(initial);
  const [content, setContent] = useState(initial?.content ?? '');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [assigneeId, setAssigneeId] = useState(initial?.assignee ? String(initial.assignee.id) : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError('할 일을 입력해 주세요.');
      inputRef.current?.focus();
      return;
    }
    if (dueDate && !isValidDateString(dueDate)) {
      setError('기한 날짜를 다시 골라 주세요.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({ content: trimmed, dueDate: dueDate || null, assigneeId: assigneeId ? Number(assigneeId) : null });
      if (!editing) {
        setContent('');
        setDueDate('');
        setAssigneeId('');
        inputRef.current?.focus();
      }
    } catch (err) {
      setError(getErrorMessage(err, '할 일을 저장하지 못했어요.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px_150px] sm:items-start">
        <TextField
          ref={inputRef}
          label="할 일"
          value={content}
          maxLength={MAX_LENGTH}
          placeholder="예: 토요일에 그 카페 같이 가기"
          inputClassName="ink text-[16px]"
          onChange={(e) => {
            setContent(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && onCancel) onCancel();
          }}
          error={error}
          autoFocus={autoFocus}
          autoComplete="off"
        />
        <TextField label="기한 (선택)" type="date" value={dueDate} min="1900-01-01" max="2100-12-31" onChange={(e) => setDueDate(e.target.value)} />
        <div>
          <label className="label" htmlFor={`assignee-${initial?.id ?? 'new'}`}>
            맡을 사람
          </label>
          <select
            id={`assignee-${initial?.id ?? 'new'}`}
            className="field"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">함께</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.id === meId ? `나 (${member.nickname})` : member.nickname}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        {onCancel && (
          <Button size="sm" onClick={onCancel} disabled={saving}>
            취소
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          variant="default"
          loading={saving}
          icon={!saving && (editing ? <Save size={12} /> : <Plus size={12} />)}
        >
          {editing ? '저장' : '할 일 추가'}
        </Button>
      </div>
    </form>
  );
}
