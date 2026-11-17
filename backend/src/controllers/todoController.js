import * as todoService from '../services/todoService.js';

export async function listTodos(req, res) {
  const result = await todoService.listTodos(req.user.id, req.valid.query);
  res.json(result);
}

export async function createTodo(req, res) {
  const todo = await todoService.createTodo(req.user.id, req.valid.body);
  res.status(201).json({ todo });
}

export async function updateTodo(req, res) {
  const todo = await todoService.updateTodo(req.user.id, req.valid.params.id, req.valid.body);
  res.json({ todo });
}

export async function setTodoStatus(req, res) {
  const todo = await todoService.setTodoDone(req.user.id, req.valid.params.id, req.valid.body);
  res.json({ todo });
}

export async function deleteTodo(req, res) {
  await todoService.deleteTodo(req.user.id, req.valid.params.id);
  res.status(204).end();
}
