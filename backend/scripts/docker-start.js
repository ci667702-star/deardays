// Docker 컨테이너 시작 순서: DB 접속 주소 준비 → 테이블 최신화(prisma migrate deploy) → API 서버 실행
// env.js 를 불러오면 DB_HOST·DB_USER·DB_PASSWORD·DB_NAME 으로 DATABASE_URL 이 만들어진다.

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { BACKEND_ROOT } from '../src/config/env.js';

const prismaCli = path.join(BACKEND_ROOT, 'node_modules', 'prisma', 'build', 'index.js');
const migrate = spawnSync(process.execPath, [prismaCli, 'migrate', 'deploy'], { stdio: 'inherit', env: process.env });

if (migrate.status !== 0) {
  console.error('[DearDays] DB 테이블을 최신 상태로 맞추지 못했어요. 위 오류와 .env 의 RDB_* 값을 확인해 주세요.');
  process.exit(migrate.status ?? 1);
}

await import('../src/server.js');
