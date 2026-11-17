import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // 업로드 이미지는 프론트엔드(다른 포트)에서도 <img>로 불러올 수 있어야 한다.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: (origin, callback) => {
        // 같은 출처 요청(origin 없음)이나 허용 목록에 있는 출처만 받는다.
        if (!origin || env.clientOrigins.includes(origin)) callback(null, true);
        else callback(null, false);
      },
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  app.use(
    '/uploads',
    express.static(env.uploadDir, {
      dotfiles: 'deny',
      index: false,
      maxAge: '7d',
      immutable: true,
    }),
  );

  app.use('/api', apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
