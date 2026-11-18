import { Router } from 'express';
import * as todoController from '../controllers/todoController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.js';
import {
  createTodoSchema,
  listTodoQuerySchema,
  todoStatusSchema,
  updateTodoSchema,
} from '../validators/todo.validators.js';

const router = Router();
router.use(requireAuth);

const byId = validate(idParamSchema, 'params');

router.get('/', validate(listTodoQuerySchema, 'query'), todoController.listTodos);
router.post('/', validate(createTodoSchema), todoController.createTodo);
// 내용·기한·맡은 사람 수정: 추가한 사람만
router.put('/:id', byId, validate(updateTodoSchema), todoController.updateTodo);
// 완료 표시: 공간 사람 누구나
router.patch('/:id/status', byId, validate(todoStatusSchema), todoController.setTodoStatus);
router.delete('/:id', byId, todoController.deleteTodo);

export default router;
