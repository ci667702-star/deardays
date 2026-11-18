import { useState } from 'react';
import { useNavigate } from 'react-router';
import RoomGate from '../components/room/RoomGate.jsx';
import TodoForm from '../components/todo/TodoForm.jsx';
import TodoItem from '../components/todo/TodoItem.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { EmptyState, ErrorMessage, Loading } from '../components/ui/Feedback.jsx';
import GroupBox from '../components/ui/GroupBox.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import Window from '../components/ui/Window.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useRooms } from '../context/RoomContext.jsx';
import { namesOf } from '../utils/rooms.js';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus.js';
import { useTodos } from '../hooks/useTodos.js';
import { getErrorMessage } from '../utils/errors.js';
import { prefs } from '../utils/storage.js';
import { isOverdue } from '../utils/todos.js';

export default function TodoPage() {
  useDocumentTitle('할 일');
  return (
    <RoomGate>
      <TodoView />
    </RoomGate>
  );
}

const EMPTY_TEXT = {
  open: { icon: 'heart', title: '남은 일이 없어요', description: '모두 끝냈어요! 새로 하고 싶은 일이 생기면 위에 적어 주세요.' },
  done: { icon: 'checklist', title: '아직 끝낸 일이 없어요', description: '할 일 앞의 네모를 누르면 끝낸 일로 옮겨져요.' },
};

function TodoView() {
  const { user } = useAuth();
  const { currentRoom, others } = useRooms();
  const toast = useToast();
  const navigate = useNavigate();
  const todos = useTodos(currentRoom.id);
  const [filter, setFilter] = useState(() => prefs.get('todoFilter') ?? 'open');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useRefreshOnFocus(todos.reload);

  const changeFilter = (value) => {
    setFilter(value);
    prefs.set('todoFilter', value);
  };

  const { counts } = todos;
  const overdue = todos.items.filter((todo) => isOverdue(todo)).length;
  const visible = todos.items.filter((todo) => (filter === 'open' ? !todo.isDone : filter === 'done' ? todo.isDone : true));
  const percent = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await todos.remove(deleteTarget.id);
      toast.success('할 일을 삭제했어요.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Window
        title={`할 일 - ${currentRoom.name}`}
        icon={<PixelIcon name="checklist" size={14} />}
        onClose={() => navigate('/')}
        closeLabel="홈으로"
        statusBar={
          <>
            <span className="flex-1">남은 일 {counts.open}개</span>
            <span className={overdue ? 'text-danger' : undefined}>기한 지남 {overdue}개</span>
            <span>끝낸 일 {counts.done}개</span>
          </>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <GroupBox title="새 할 일">
            <TodoForm members={currentRoom.members} meId={user.id} onSubmit={todos.add} />
          </GroupBox>
          <GroupBox title="진행 상황">
            <p className="text-[18px]">
              {counts.total}개 중 {counts.done}개 끝냄
            </p>
            <div
              className="progress progress--static mt-2"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-label="끝낸 할 일 비율"
            >
              <span style={{ width: `${percent}%` }} />
            </div>
            <p className="font-small mt-2 text-[12px] text-muted">
              {others.length > 0 ? `${namesOf(others)}과 함께 보는 목록이에요. 누구든 체크할 수 있어요.` : '친구가 들어오면 같은 목록을 함께 보고 체크할 수 있어요.'}
            </p>
          </GroupBox>
        </div>

        <div className="mt-5">
          <Tabs
            label="할 일 보기"
            value={filter}
            onChange={changeFilter}
            tabs={[
              { value: 'open', label: `남은 일 ${counts.open}` },
              { value: 'done', label: `끝낸 일 ${counts.done}` },
              { value: 'all', label: `전체 ${counts.total}` },
            ]}
          >
            {todos.loading && <Loading label="할 일을 불러오는 중..." />}
            {todos.error && <ErrorMessage error={todos.error} onRetry={todos.reload} />}
            {!todos.loading && !todos.error && counts.total === 0 && (
              <EmptyState
                icon="checklist"
                title="아직 할 일이 없어요"
                description="함께 하고 싶은 일이나 잊으면 안 되는 약속을 적어 보세요. 공간 사람 누구나 체크할 수 있어요."
              />
            )}
            {!todos.loading && !todos.error && counts.total > 0 && visible.length === 0 && filter !== 'all' && (
              <EmptyState {...EMPTY_TEXT[filter]} />
            )}
            {visible.length > 0 && (
              <ul className="sunken divide-y divide-rule">
                {visible.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    meId={user.id}
                    members={currentRoom.members}
                    onToggle={todos.toggle}
                    onUpdate={todos.update}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </ul>
            )}
          </Tabs>
        </div>
      </Window>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="할 일 삭제"
        message={deleteTarget ? `'${deleteTarget.content}'을(를) 목록에서 지울까요?` : ''}
        detail="지운 할 일은 되돌릴 수 없어요. 끝낸 일이라면 지우지 않고 '끝낸 일'에 남겨 둘 수도 있어요."
        confirmLabel="삭제"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
