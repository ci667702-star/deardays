import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`[DearDays] API 서버가 http://localhost:${env.port} 에서 실행 중입니다.`);
  checkDatabase();
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `[DearDays] ${env.port}번 포트를 이미 다른 프로그램이 쓰고 있어요. 켜 둔 API 서버를 끄거나 backend/.env 의 PORT 를 바꿔 주세요.`,
    );
    process.exit(1);
  }
  throw error;
});

/** 시작할 때 DB 연결을 확인해, 설정이 잘못됐으면 무엇을 고쳐야 하는지 바로 알려 준다. */
async function checkDatabase() {
  if (process.env.DATABASE_URL.includes('YOUR_MYSQL_PASSWORD')) {
    console.error('[DearDays] backend/.env 의 DATABASE_URL 에 아직 YOUR_MYSQL_PASSWORD 가 그대로 있어요. MySQL 비밀번호로 바꾼 뒤 서버를 다시 켜 주세요.');
    return;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[DearDays] MySQL 연결 확인 완료');
  } catch (error) {
    const reason = String(error.message).trim().split('\n').pop();
    console.error(
      `[DearDays] MySQL 에 연결하지 못했어요. MySQL 이 켜져 있는지, backend/.env 의 DATABASE_URL(사용자·비밀번호·포트·DB 이름)이 맞는지 확인해 주세요.\n  → ${reason}`,
    );
  }
}

async function shutdown(signal) {
  console.log(`[DearDays] ${signal} 수신, 서버를 종료합니다.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
