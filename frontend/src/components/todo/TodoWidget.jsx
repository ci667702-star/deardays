import { useState } from 'react';
import { Link } from 'react-router';
import { ListChecks, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus.js';
import { useTodos } from '../../hooks/useTodos.js';
import { getErrorMessage } from '../../utils/errors.js';
import Button from '../ui/Button.jsx';
import { ErrorMessage, Loading } from '../ui/Feedback.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';
import Window from '../ui/Window.jsx';
import TodoItem from './TodoItem.jsx';

const PREVIEW_COUNT = 5;

/** 홈 화면용 할 일 미리보기: 남은 일 5개 + 빠른 추가 */
export default function TodoWidget({ room }) {
  const { user } = useAuth();
  const todos = useTodos(room.id);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useRefreshOnFocus(todos.reload);

  const open = todos.items.filter((todo) => !todo.isDone);
  const preview = open.slice(0, PREVIEW_COUNT);

  const quickAdd = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return setError('할 일을 입력해 주세요.');
    setAdding(true);
    setError('');
    try {
      await todos.add({ content, dueDate: null, assigneeId: null });
      setDraft('');
    } catch (err) {
      setError(getErrorMessage(err, '할 일을 추가하지 못했어요.'));
    } finally {
      setAdding(false);
    }
  };

  return (
    <Window
      title="할 일"
      icon={<PixelIcon name="checklist" size={14} />}
      toolbar={
        <Link to="/todos" className="btn-tool">
          <ListChecks size={14} /> 모두 보기
        </Link>
      }
      statusBar={
        <>
          <span className="flex-1">남은 일 {todos.counts.open}개</span>
          <span>
            {todos.counts.done}/{todos.counts.total} 끝냄
          </span>
        </>
      }
    >
      <form onSubmit={quickAdd} noValidate className="flex gap-2">
        <label htmlFor="quick-todo" className="sr-only">
          새 할 일
        </label>
        <input
          id="quick-todo"
          className="field ink text-[15px]"
          placeholder="함께 할 일을 적고 Enter"
          value={draft}
          maxLength={200}
          autoComplete="off"
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError('');
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'quick-todo-error' : undefined}
        />
        <Button type="submit" size="sm" loading={adding} icon={!adding && <Plus size={12} />} className="shrink-0">
          추가
        </Button>
      </form>
      {error && (
        <p id="quick-todo-error" className="hint hint--error">
          {error}
        </p>
      )}

      <div className="mt-3">
        {todos.loading && <Loading compact label="할 일을 불러오는 중..." />}
        {todos.error && <ErrorMessage error={todos.error} onRetry={todos.reload} />}
        {!todos.loading && !todos.error && preview.length === 0 && (
          <p className="font-small py-2 text-center text-[12px] text-muted">
            {todos.counts.total > 0 ? '남은 일을 모두 끝냈어요!' : '기한이나 맡을 사람을 정하려면 할 일 화면에서 추가하세요.'}
          </p>
        )}
        {preview.length > 0 && (
          <ul className="sunken divide-y divide-rule">
            {preview.map((todo) => (
              <TodoItem key={todo.id} todo={todo} meId={user.id} members={room.members} onToggle={todos.toggle} compact />
            ))}
          </ul>
        )}
        {open.length > PREVIEW_COUNT && (
          <Link to="/todos" className="font-small mt-2 block text-right text-[12px] text-title underline">
            남은 일 {open.length - PREVIEW_COUNT}개 더 보기
          </Link>
        )}
      </div>
    </Window>
  );
}
