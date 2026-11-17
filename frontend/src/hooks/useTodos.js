import { useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { todoService } from '../services/todoService.js';
import { getErrorMessage } from '../utils/errors.js';
import { countTodos, sortTodos } from '../utils/todos.js';
import { useFetch } from './useFetch.js';

/**
 * 한 공간의 할 일 목록과 조작 함수.
 * 완료 체크는 누르는 즉시 화면에 반영하고, 실패하면 원래대로 되돌린다.
 */
export function useTodos(roomId) {
  const { user } = useAuth();
  const toast = useToast();
  const pending = useRef(new Set());

  const { data, loading, error, reload, setData } = useFetch(() => todoService.list(roomId), [roomId], {
    enabled: Boolean(roomId),
  });

  const items = useMemo(() => data?.items ?? [], [data]);
  const counts = useMemo(() => countTodos(items), [items]);

  const setItems = useCallback(
    (updater) => setData((prev) => ({ ...(prev ?? {}), items: sortTodos(updater(prev?.items ?? [])) })),
    [setData],
  );

  const replace = useCallback((todo) => setItems((list) => list.map((t) => (t.id === todo.id ? todo : t))), [setItems]);

  const add = useCallback(
    async (payload) => {
      const todo = await todoService.create({ roomId, ...payload });
      setItems((list) => [...list, todo]);
      return todo;
    },
    [roomId, setItems],
  );

  const toggle = useCallback(
    async (todo) => {
      if (pending.current.has(todo.id)) return;
      pending.current.add(todo.id);
      const isDone = !todo.isDone;
      replace({
        ...todo,
        isDone,
        doneAt: isDone ? new Date().toISOString() : null,
        completedBy: isDone ? user : null,
      });
      try {
        replace(await todoService.setDone(todo.id, isDone));
      } catch (err) {
        replace(todo);
        toast.error(getErrorMessage(err, '완료 표시를 저장하지 못했어요.'));
      } finally {
        pending.current.delete(todo.id);
      }
    },
    [replace, toast, user],
  );

  const update = useCallback(
    async (id, payload) => {
      const todo = await todoService.update(id, payload);
      replace(todo);
      return todo;
    },
    [replace],
  );

  const remove = useCallback(
    async (id) => {
      await todoService.remove(id);
      setItems((list) => list.filter((t) => t.id !== id));
    },
    [setItems],
  );

  return { items, counts, loading: loading && !data, error, reload, add, toggle, update, remove };
}
