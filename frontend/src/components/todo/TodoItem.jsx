import { useId, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { formatDateTime, formatShortDate, todayString } from '../../utils/date.js';
import { cx } from '../../utils/cx.js';
import { dueInfo } from '../../utils/todos.js';
import Avatar from '../ui/Avatar.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';
import TodoForm from './TodoForm.jsx';

function AssigneeChip({ assignee, meId }) {
  if (!assignee) {
    return (
      <span className="chip" title="모두 함께 하는 일">
        <PixelIcon name="heartSmall" size={10} />
        함께
      </span>
    );
  }
  return (
    <span className="chip" title={`맡은 사람: ${assignee.nickname}`}>
      <Avatar user={assignee} size={14} />
      {assignee.id === meId ? '나' : assignee.nickname}
    </span>
  );
}

const who = (person, meId, suffix) => (person?.id === meId ? `내가 ${suffix}` : `${person?.nickname ?? '알 수 없음'}님이 ${suffix}`);

/**
 * 할 일 한 줄. 체크박스는 공간 사람 누구나 누를 수 있고, 수정·삭제는 적은 사람에게만 보인다.
 * compact: 홈 화면 미리보기용 (적은 사람·버튼 숨김)
 */
export default function TodoItem({ todo, meId, members, onToggle, onUpdate, onDelete, compact = false }) {
  const checkboxId = useId();
  const [editing, setEditing] = useState(false);
  const due = dueInfo(todo);

  if (editing) {
    return (
      <li className="bg-lav-soft px-3 py-3">
        <TodoForm
          initial={todo}
          members={members}
          meId={meId}
          autoFocus
          onSubmit={async (payload) => {
            await onUpdate(todo.id, payload);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className={cx('flex items-start gap-3', compact ? 'px-2 py-2' : 'px-3 py-2.5')}>
      <input
        id={checkboxId}
        type="checkbox"
        className="checkbox mt-[3px]"
        checked={todo.isDone}
        onChange={() => onToggle(todo)}
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={checkboxId}
          className={cx(
            'ink block cursor-pointer break-words leading-snug',
            compact ? 'text-[15px]' : 'text-[16px]',
            todo.isDone && 'text-muted line-through',
          )}
        >
          {todo.content}
        </label>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          {due && <span className={cx('chip', `chip--${due.tone}`)}>{due.text}</span>}
          <AssigneeChip assignee={todo.assignee} meId={meId} />
          {!compact && (
            <span className="list-meta" title={formatDateTime(todo.isDone ? todo.doneAt : todo.createdAt)}>
              {todo.isDone && todo.completedBy
                ? `${who(todo.completedBy, meId, '끝냈어요')} (${formatShortDate(todayString(new Date(todo.doneAt)))})`
                : who(todo.creator, meId, '적었어요')}
            </span>
          )}
        </div>
      </div>
      {!compact && todo.isMine && (
        <span className="flex shrink-0 gap-1">
          <button type="button" className="btn-tool min-h-0 py-1 text-[12px]" onClick={() => setEditing(true)} aria-label={`'${todo.content}' 수정`}>
            <Pencil size={12} />
            <span className="hidden sm:inline">수정</span>
          </button>
          <button
            type="button"
            className="btn-tool min-h-0 py-1 text-[12px] text-danger"
            onClick={() => onDelete(todo)}
            aria-label={`'${todo.content}' 삭제`}
          >
            <Trash2 size={12} />
            <span className="hidden sm:inline">삭제</span>
          </button>
        </span>
      )}
    </li>
  );
}
