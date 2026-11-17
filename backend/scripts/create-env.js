/* eslint-disable no-console */
// backend/.env 를 처음 만들어 준다: .env.example 을 복사하고 JWT_SECRET 에 임의 값을 채운다.
// 이미 .env 가 있으면 덮어쓰지 않는다.   실행: npm run setup:env

import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const examplePath = path.join(backendDir, '.env.example');
const envPath = path.join(backendDir, '.env');

if (fs.existsSync(envPath)) {
  console.log('backend/.env 가 이미 있어서 그대로 둡니다. 다시 만들려면 파일을 지운 뒤 실행해 주세요.');
  process.exit(0);
}

const secret = randomBytes(48).toString('hex');
const content = fs
  .readFileSync(examplePath, 'utf8')
  .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET="${secret}"`);

fs.writeFileSync(envPath, content);
console.log('backend/.env 를 만들었어요. (JWT_SECRET 은 임의 값으로 채움)');
console.log('이제 backend/.env 를 열어 DATABASE_URL 의 YOUR_MYSQL_PASSWORD 를 MySQL 비밀번호로 바꿔 주세요.');
