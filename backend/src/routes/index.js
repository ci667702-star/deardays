import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import authRoutes from './auth.routes.js';
import roomRoutes from './room.routes.js';
import diaryRoutes from './diary.routes.js';
import commentRoutes from './comment.routes.js';
import userRoutes from './user.routes.js';
import todoRoutes from './todo.routes.js';
import notificationRoutes from './notification.routes.js';
import letterRoutes from './letter.routes.js';
import topicRoutes from './topic.routes.js';
import adminRoutes from './admin.routes.js';
import anniversaryRoutes from './anniversary.routes.js';
import pushRoutes from './push.routes.js';
import inquiryRoutes from './inquiry.routes.js';

const router = Router();

router.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok', time: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/diaries', diaryRoutes);
router.use('/comments', commentRoutes);
router.use('/users', userRoutes);
router.use('/todos', todoRoutes);
router.use('/notifications', notificationRoutes);
router.use('/letters', letterRoutes);
router.use('/topics', topicRoutes);
router.use('/admin', adminRoutes);
router.use('/anniversaries', anniversaryRoutes);
router.use('/push', pushRoutes);
router.use('/inquiries', inquiryRoutes);

export default router;
