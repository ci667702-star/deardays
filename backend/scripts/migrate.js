// 개발 서버를 켜기 전에 DB 테이블을 최신 상태로 맞춘다. (npm run dev 의 predev 로 자동 실행)
// 처음 설치했거나 git pull 로 새 마이그레이션이 생겨도 따로 명령할 필요가 없다.
// 이미 적용된 마이그레이션은 건너뛰고, 데이터는 지우지 않는다 (prisma migrate deploy).
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { BACKEND_ROOT } from '../src/config/env.js';

if (process.env.DATABASE_URL.includes('YOUR_MYSQL_PASSWORD')) {
  console.error('[DearDays] backend/.env 의 DATABASE_URL 에 아직 YOUR_MYSQL_PASSWORD 가 그대로 있어요. MySQL 비밀번호로 바꾼 뒤 다시 실행해 주세요.');
  process.exit(1);
}

const prismaCli = path.join(BACKEND_ROOT, 'node_modules', 'prisma', 'build', 'index.js');
const result = spawnSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
  cwd: BACKEND_ROOT,
  stdio: 'inherit',
  env: process.env,
});

if (result.status !== 0) {
  console.error(
    '[DearDays] DB 테이블을 최신 상태로 맞추지 못했어요. MySQL 이 켜져 있는지, backend/.env 의 DATABASE_URL(사용자·비밀번호·포트·DB 이름)이 맞는지 확인해 주세요.',
  );
  process.exit(result.status ?? 1);
}
