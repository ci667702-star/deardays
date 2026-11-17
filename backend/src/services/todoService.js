import { prisma } from '../config/prisma.js';
import { MAX_TODOS_PER_ROOM } from '../config/constants.js';
import { HttpError } from '../utils/HttpError.js';
import { toDbDate } from '../utils/date.js';
import { toTodo } from '../utils/serializers.js';
import { assertRoomMember } from './roomService.js';

const todoInclude = { creator: true, assignee: true, completedBy: true };

const TODO_NOT_FOUND = () => HttpError.notFound('할 일을 찾을 수 없어요. 삭제되었을 수도 있어요.', 'TODO_NOT_FOUND');

/** 맡을 사람은 그 공간의 멤버여야 한다 (null 이면 '함께') */
async function assertAssigneeInRoom(roomId, assigneeId) {
  if (assigneeId === null) return;
  const membership = await prisma.diaryRoomMember.findUnique({
    where: { userId_diaryRoomId: { userId: assigneeId, diaryRoomId: roomId } },
    select: { id: true },
  });
  if (!membership) {
    throw HttpError.badRequest('맡을 사람은 이 공간의 멤버 중에서 골라 주세요.', 'INVALID_ASSIGNEE');
  }
}

/** 할 일을 찾고, 요청자가 그 공간의 멤버인지 확인한다. 아니면 존재 자체를 숨긴다(404). */
async function findTodoForMember(todoId, userId) {
  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    select: { id: true, diaryRoomId: true, creatorId: true, isDone: true },
  });
  if (!todo) throw TODO_NOT_FOUND();

  const membership = await prisma.diaryRoomMember.findUnique({
    where: { userId_diaryRoomId: { userId, diaryRoomId: todo.diaryRoomId } },
    select: { id: true },
  });
  if (!membership) throw TODO_NOT_FOUND();
  return todo;
}

/**
 * 정렬: 남은 일이 먼저.
 *  - 남은 일: 기한 있는 것(가까운 순) → 기한 없는 것(먼저 추가한 순)
 *  - 끝낸 일: 최근에 끝낸 순
 */
function sortTodos(todos) {
  const time = (date) => (date ? new Date(date).getTime() : 0);
  return [...todos].sort((a, b) => {
    if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
    if (a.isDone) return time(b.doneAt) - time(a.doneAt) || b.id - a.id;
    if (a.dueDate && b.dueDate) return time(a.dueDate) - time(b.dueDate) || a.id - b.id;
    if (a.dueDate || b.dueDate) return a.dueDate ? -1 : 1;
    return a.id - b.id;
  });
}

export async function listTodos(userId, { roomId }) {
  await assertRoomMember(roomId, userId);
  const todos = await prisma.todo.findMany({ where: { diaryRoomId: roomId }, include: todoInclude });
  const done = todos.filter((todo) => todo.isDone).length;
  return {
    items: sortTodos(todos).map((todo) => toTodo(todo, userId)),
    counts: { total: todos.length, done, open: todos.length - done },
  };
}

export async function createTodo(userId, { roomId, content, dueDate, assigneeId }) {
  await assertRoomMember(roomId, userId);

  const count = await prisma.todo.count({ where: { diaryRoomId: roomId } });
  if (count >= MAX_TODOS_PER_ROOM) {
    throw HttpError.badRequest(
      `할 일은 한 공간에 ${MAX_TODOS_PER_ROOM}개까지 둘 수 있어요. 끝낸 일을 정리해 주세요.`,
      'TOO_MANY_TODOS',
    );
  }
  await assertAssigneeInRoom(roomId, assigneeId);

  const todo = await prisma.todo.create({
    data: {
      diaryRoomId: roomId,
      creatorId: userId,
      content,
      dueDate: dueDate ? toDbDate(dueDate) : null,
      assigneeId,
    },
    include: todoInclude,
  });
  return toTodo(todo, userId);
}

export async function updateTodo(userId, todoId, { content, dueDate, assigneeId }) {
  const todo = await findTodoForMember(todoId, userId);
  if (todo.creatorId !== userId) {
    throw HttpError.forbidden('내가 추가한 할 일만 수정할 수 있어요.', 'NOT_AUTHOR');
  }
  await assertAssigneeInRoom(todo.diaryRoomId, assigneeId);

  const updated = await prisma.todo.update({
    where: { id: todoId },
    data: { content, dueDate: dueDate ? toDbDate(dueDate) : null, assigneeId },
    include: todoInclude,
  });
  return toTodo(updated, userId);
}

/** 완료 표시는 두 사람 모두 할 수 있다. 누가 끝냈는지 기록한다. */
export async function setTodoDone(userId, todoId, { isDone }) {
  const todo = await findTodoForMember(todoId, userId);

  const updated =
    todo.isDone === isDone
      ? await prisma.todo.findUnique({ where: { id: todoId }, include: todoInclude })
      : await prisma.todo.update({
          where: { id: todoId },
          data: { isDone, doneAt: isDone ? new Date() : null, completedById: isDone ? userId : null },
          include: todoInclude,
        });
  return toTodo(updated, userId);
}

export async function deleteTodo(userId, todoId) {
  const todo = await findTodoForMember(todoId, userId);
  if (todo.creatorId !== userId) {
    throw HttpError.forbidden('내가 추가한 할 일만 삭제할 수 있어요.', 'NOT_AUTHOR');
  }
  await prisma.todo.delete({ where: { id: todoId } });
}
