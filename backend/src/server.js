import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`[DearDays] API 서버가 http://localhost:${env.port} 에서 실행 중입니다.`);
});

async function shutdown(signal) {
  console.log(`[DearDays] ${signal} 수신, 서버를 종료합니다.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
