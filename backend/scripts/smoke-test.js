/* eslint-disable no-console */
// DearDays API 통합 스모크 테스트
// 실행 중인 API 서버(기본 http://localhost:4000)를 대상으로 두 사용자 시나리오 전체를 검증한다.
//   사용법: npm run test:api   (API_URL 환경변수로 대상 변경 가능)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API = process.env.API_URL ?? 'http://localhost:4000';
const BACKEND_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// 서버와 같은 업로드 폴더를 본다 (Docker 컨테이너에서는 UPLOAD_DIR=/data/uploads)
const UPLOAD_DIR = path.resolve(BACKEND_DIR, process.env.UPLOAD_DIR ?? 'uploads');
const RUN = Date.now().toString(36);

// 1x1 PNG, 1x1 GIF
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

let passed = 0;
let failed = 0;

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  ✔ ${name}`);
  } else {
    failed += 1;
    console.log(`  ✘ ${name} ${detail}`);
  }
}

async function call(method, url, { token, json, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form) {
    body = form;
  }
  const res = await fetch(`${API}${url}`, { method, headers, body });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

function diaryForm(fields, files = []) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, String(value));
  for (const file of files) form.append('images', new Blob([file.buffer], { type: file.type }), file.name);
  return form;
}

const uploadExists = (url) => fs.existsSync(path.join(UPLOAD_DIR, url.replace('/uploads/', '')));

async function main() {
  console.log(`DearDays API 스모크 테스트 → ${API}\n`);

  console.log('[인증]');
  const health = await call('GET', '/api/health');
  check('헬스 체크 200', health.status === 200, JSON.stringify(health.data));

  const emailA = `alice_${RUN}@test.dev`;
  const emailB = `bora_${RUN}@test.dev`;
  const emailC = `chan_${RUN}@test.dev`;
  const pw = 'diary1234';

  let r = await call('POST', '/api/auth/register', { json: { email: emailA, nickname: '앨리스', password: pw } });
  check('A 회원가입 201 + 토큰', r.status === 201 && r.data.token && !r.data.user.password, JSON.stringify(r.data));
  const tokenA = r.data.token;
  const userA = r.data.user;

  r = await call('POST', '/api/auth/register', { json: { email: emailA.toUpperCase(), nickname: '중복', password: pw } });
  check('중복 이메일(대소문자 무시) 409', r.status === 409, JSON.stringify(r.data));

  r = await call('POST', '/api/auth/register', { json: { email: 'not-an-email', nickname: '테스트', password: pw } });
  check('잘못된 이메일 400', r.status === 400, JSON.stringify(r.data));

  r = await call('POST', '/api/auth/register', { json: { email: `weak_${RUN}@test.dev`, nickname: '테스트', password: 'short' } });
  check('약한 비밀번호 400', r.status === 400, JSON.stringify(r.data));

  r = await call('GET', `/api/auth/check-email?email=${encodeURIComponent(emailA)}`);
  check('이메일 중복 확인: 사용 중', r.status === 200 && r.data.available === false);

  r = await call('POST', '/api/auth/register', { json: { email: emailB, nickname: '보라', password: pw } });
  const tokenB = r.data.token;
  const userB = r.data.user;
  r = await call('POST', '/api/auth/register', { json: { email: emailC, nickname: '찬희', password: pw } });
  const tokenC = r.data.token;
  const userC = r.data.user;
  check('B, C 회원가입', Boolean(tokenB && tokenC));

  r = await call('POST', '/api/auth/login', { json: { email: emailA, password: 'wrong-pass1' } });
  check('틀린 비밀번호 401', r.status === 401);
  r = await call('POST', '/api/auth/login', { json: { email: `nobody_${RUN}@test.dev`, password: pw } });
  check('없는 계정 401 (같은 메시지)', r.status === 401);
  r = await call('POST', '/api/auth/login', { json: { email: emailA, password: pw } });
  check('A 로그인 200', r.status === 200 && r.data.token);

  r = await call('GET', '/api/auth/me');
  check('토큰 없이 /me 401', r.status === 401);
  r = await call('GET', '/api/auth/me', { token: 'garbage.token.value' });
  check('잘못된 토큰 401', r.status === 401);
  r = await call('GET', '/api/auth/me', { token: tokenA });
  check('/me 200', r.status === 200 && r.data.user.email === emailA);

  console.log('\n[공유 공간]');
  r = await call('POST', '/api/rooms', { token: tokenA, json: { name: '우리의 교환일기' } });
  check('A 공간 생성 201 + 초대 코드', r.status === 201 && /^[A-Z2-9]{8}$/.test(r.data.room.inviteCode), JSON.stringify(r.data));
  const room = r.data.room;

  r = await call('POST', '/api/rooms/join', { token: tokenB, json: { inviteCode: 'abc' } });
  check('형식이 틀린 초대 코드 400', r.status === 400);
  r = await call('POST', '/api/rooms/join', { token: tokenB, json: { inviteCode: 'ZZZZZZZZ' } });
  check('없는 초대 코드 404', r.status === 404);

  const messyCode = `${room.inviteCode.slice(0, 4).toLowerCase()}-${room.inviteCode.slice(4)}`;
  r = await call('POST', '/api/rooms/join', { token: tokenB, json: { inviteCode: messyCode } });
  check('B 참여 (소문자·하이픈 허용) 201', r.status === 201 && r.data.room.members.length === 2, JSON.stringify(r.data));

  r = await call('POST', '/api/rooms/join', { token: tokenA, json: { inviteCode: room.inviteCode } });
  check('이미 참여 중 409', r.status === 409);
  r = await call('POST', '/api/rooms/join', { token: tokenC, json: { inviteCode: room.inviteCode } });
  check('세 번째 사람 참여 불가 409 ROOM_FULL', r.status === 409 && r.data.code === 'ROOM_FULL');

  r = await call('GET', `/api/rooms/${room.id}`, { token: tokenC });
  check('멤버 아닌 사람 공간 조회 404', r.status === 404);
  r = await call('GET', '/api/rooms', { token: tokenB });
  check('B 공간 목록', r.status === 200 && r.data.rooms.length === 1);

  r = await call('PATCH', `/api/rooms/${room.id}`, { token: tokenB, json: { name: '보라와 앨리스' } });
  check('공간 이름 변경', r.status === 200 && r.data.room.name === '보라와 앨리스');

  console.log('\n[일기 + 사진]');
  r = await call('POST', '/api/diaries', {
    token: tokenA,
    form: diaryForm({ roomId: room.id, title: '첫 일기', content: '오늘은 날씨가 맑았다.', diaryDate: '2026-11-15' }, [
      { buffer: PNG, type: 'image/png', name: 'a.png' },
      { buffer: GIF, type: 'image/gif', name: 'b.gif' },
    ]),
  });
  check('사진 2장과 일기 작성 201', r.status === 201 && r.data.diary.images.length === 2, JSON.stringify(r.data));
  const diary1 = r.data.diary;
  check('업로드 파일이 디스크에 저장됨', diary1.images.every((img) => uploadExists(img.imageUrl)));

  r = await call('GET', diary1.images[0].imageUrl);
  check('업로드 이미지 정적 제공 200', r.status === 200);

  r = await call('POST', '/api/diaries', {
    token: tokenA,
    form: diaryForm({ roomId: room.id, title: '가짜', content: '내용', diaryDate: '2026-11-15' }, [
      { buffer: Buffer.from('not really a png'), type: 'image/png', name: 'fake.png' },
    ]),
  });
  check('내용이 이미지가 아닌 파일 400', r.status === 400, JSON.stringify(r.data));

  r = await call('POST', '/api/diaries', {
    token: tokenA,
    form: diaryForm({ roomId: room.id, title: '실행파일', content: '내용', diaryDate: '2026-11-15' }, [
      { buffer: PNG, type: 'application/octet-stream', name: 'evil.exe' },
    ]),
  });
  check('허용되지 않은 확장자 400', r.status === 400);

  r = await call('POST', '/api/diaries', {
    token: tokenA,
    form: diaryForm(
      { roomId: room.id, title: '사진 과다', content: '내용', diaryDate: '2026-11-15' },
      Array.from({ length: 7 }, (_, i) => ({ buffer: PNG, type: 'image/png', name: `${i}.png` })),
    ),
  });
  check('사진 7장 400', r.status === 400);

  r = await call('POST', '/api/diaries', {
    token: tokenA,
    form: diaryForm({ roomId: room.id, title: '', content: '내용', diaryDate: '2026-11-15' }),
  });
  check('제목 없음 400', r.status === 400);

  r = await call('POST', '/api/diaries', {
    token: tokenA,
    form: diaryForm({ roomId: room.id, title: '날짜 오류', content: '내용', diaryDate: '2026-02-30' }),
  });
  check('없는 날짜 400', r.status === 400);

  r = await call('POST', '/api/diaries', {
    token: tokenC,
    form: diaryForm({ roomId: room.id, title: '침입', content: '내용', diaryDate: '2026-11-15' }),
  });
  check('멤버 아닌 사람 일기 작성 404', r.status === 404);

  r = await call('POST', '/api/diaries', {
    token: tokenB,
    json: { roomId: room.id, title: '보라의 하루', content: '카페에 갔다.', diaryDate: '2026-11-16' },
  });
  check('B 일기 작성 (JSON, 사진 없음) 201', r.status === 201, JSON.stringify(r.data));
  const diary2 = r.data.diary;

  r = await call('GET', `/api/diaries?roomId=${room.id}`, { token: tokenB });
  check('최신순 목록', r.status === 200 && r.data.items[0].id === diary2.id && r.data.total === 2);
  r = await call('GET', `/api/diaries?roomId=${room.id}&sort=oldest`, { token: tokenB });
  check('과거순 목록', r.status === 200 && r.data.items[0].id === diary1.id);
  r = await call('GET', `/api/diaries?roomId=${room.id}&date=2026-11-15`, { token: tokenB });
  check('날짜 필터', r.status === 200 && r.data.items.length === 1 && r.data.items[0].diaryDate === '2026-11-15');
  r = await call('GET', `/api/diaries?roomId=${room.id}&limit=1&page=2`, { token: tokenB });
  check('페이지네이션', r.status === 200 && r.data.items.length === 1 && r.data.hasMore === false);
  r = await call('GET', `/api/diaries?roomId=${room.id}`, { token: tokenC });
  check('멤버 아닌 사람 목록 404', r.status === 404);

  r = await call('GET', `/api/diaries/calendar?roomId=${room.id}&month=2026-11`, { token: tokenA });
  check(
    '달력: 15일·16일 표시',
    r.status === 200 && r.data.days.map((d) => d.date).join(',') === '2026-11-15,2026-11-16',
    JSON.stringify(r.data),
  );

  r = await call('GET', `/api/diaries/${diary1.id}`, { token: tokenB });
  check('친구 일기 상세 조회', r.status === 200 && r.data.diary.isMine === false && r.data.diary.author.nickname === '앨리스');
  r = await call('GET', `/api/diaries/${diary1.id}`, { token: tokenC });
  check('멤버 아닌 사람 상세 404', r.status === 404);

  r = await call('PUT', `/api/diaries/${diary1.id}`, {
    token: tokenB,
    form: diaryForm({ title: '남의 일기 수정', content: 'x', diaryDate: '2026-11-15' }),
  });
  check('남의 일기 수정 403', r.status === 403);

  const removed = diary1.images[0];
  r = await call('PUT', `/api/diaries/${diary1.id}`, {
    token: tokenA,
    form: diaryForm(
      { title: '첫 일기 (수정)', content: '수정한 내용', diaryDate: '2026-11-14', removeImageIds: JSON.stringify([removed.id]) },
      [{ buffer: PNG, type: 'image/png', name: 'c.png' }],
    ),
  });
  check(
    '작성자 수정: 사진 1장 삭제 + 1장 추가',
    r.status === 200 && r.data.diary.images.length === 2 && r.data.diary.diaryDate === '2026-11-14' && !r.data.diary.images.some((i) => i.id === removed.id),
    JSON.stringify(r.data),
  );
  check('삭제한 사진 파일이 디스크에서 지워짐', !uploadExists(removed.imageUrl));
  const diary1Updated = r.data.diary;

  console.log('\n[공감]');
  r = await call('POST', `/api/diaries/${diary1.id}/likes`, { token: tokenB });
  check('B 공감', r.status === 200 && r.data.liked && r.data.likeCount === 1);
  r = await call('POST', `/api/diaries/${diary1.id}/likes`, { token: tokenB });
  check('중복 공감은 1회로 유지', r.status === 200 && r.data.likeCount === 1);
  r = await call('POST', `/api/diaries/${diary1.id}/likes`, { token: tokenA });
  check('내 일기에도 공감 가능', r.data.likeCount === 2);
  r = await call('GET', `/api/diaries/${diary1.id}`, { token: tokenB });
  check('likedByMe 반영', r.data.diary.likedByMe === true && r.data.diary.likeCount === 2);
  r = await call('DELETE', `/api/diaries/${diary1.id}/likes`, { token: tokenB });
  check('공감 취소', r.status === 200 && !r.data.liked && r.data.likeCount === 1);
  r = await call('POST', `/api/diaries/${diary1.id}/likes`, { token: tokenC });
  check('멤버 아닌 사람 공감 404', r.status === 404);

  console.log('\n[댓글]');
  r = await call('POST', `/api/diaries/${diary1.id}/comments`, { token: tokenB, json: { content: '나도 그 카페 가고 싶다!' } });
  check('B 댓글 작성 201', r.status === 201 && r.data.comment.author.nickname === '보라');
  const comment = r.data.comment;
  r = await call('POST', `/api/diaries/${diary1.id}/comments`, { token: tokenB, json: { content: '   ' } });
  check('빈 댓글 400', r.status === 400);
  r = await call('PUT', `/api/comments/${comment.id}`, { token: tokenA, json: { content: '남의 댓글 수정' } });
  check('남의 댓글 수정 403', r.status === 403);
  r = await call('PUT', `/api/comments/${comment.id}`, { token: tokenB, json: { content: '다음 주에 같이 가자' } });
  check('본인 댓글 수정', r.status === 200 && r.data.comment.content === '다음 주에 같이 가자');
  r = await call('GET', `/api/diaries/${diary1.id}/comments`, { token: tokenA });
  check('댓글 목록', r.status === 200 && r.data.comments.length === 1 && r.data.comments[0].isMine === false);
  r = await call('DELETE', `/api/comments/${comment.id}`, { token: tokenA });
  check('남의 댓글 삭제 403', r.status === 403);
  r = await call('GET', `/api/diaries/${diary1.id}/comments`, { token: tokenC });
  check('멤버 아닌 사람 댓글 조회 404', r.status === 404);
  r = await call('DELETE', `/api/comments/${comment.id}`, { token: tokenB });
  check('본인 댓글 삭제 204', r.status === 204);

  console.log('\n[할 일]');
  r = await call('POST', '/api/todos', {
    token: tokenA,
    json: { roomId: room.id, content: '토요일에 카페 가기', dueDate: '2026-11-21', assigneeId: userB.id },
  });
  check(
    '할 일 추가 (기한·맡은 사람)',
    r.status === 201 && r.data.todo.assignee?.id === userB.id && r.data.todo.dueDate === '2026-11-21' && !r.data.todo.isDone,
    JSON.stringify(r.data),
  );
  const todo1 = r.data.todo;
  r = await call('POST', '/api/todos', { token: tokenB, json: { roomId: room.id, content: '사진 인화하기' } });
  check('기한·맡은 사람 없이 추가하면 함께 하는 일', r.status === 201 && r.data.todo.assignee === null && r.data.todo.dueDate === null);
  const todo2 = r.data.todo;
  r = await call('POST', '/api/todos', { token: tokenA, json: { roomId: room.id, content: '   ' } });
  check('빈 할 일 400', r.status === 400);
  r = await call('POST', '/api/todos', { token: tokenA, json: { roomId: room.id, content: '맡기기', assigneeId: userC.id } });
  check('멤버 아닌 사람에게 맡기기 400', r.status === 400 && r.data.code === 'INVALID_ASSIGNEE', JSON.stringify(r.data));
  r = await call('POST', '/api/todos', { token: tokenA, json: { roomId: room.id, content: '날짜 오류', dueDate: '2026-13-01' } });
  check('잘못된 기한 400', r.status === 400);
  r = await call('POST', '/api/todos', { token: tokenC, json: { roomId: room.id, content: '침입' } });
  check('멤버 아닌 사람 할 일 추가 404', r.status === 404);

  r = await call('GET', `/api/todos?roomId=${room.id}`, { token: tokenB });
  check(
    '목록: 기한 있는 일이 먼저, 개수',
    r.status === 200 && r.data.items[0].id === todo1.id && r.data.counts.total === 2 && r.data.counts.open === 2,
    JSON.stringify(r.data.counts),
  );
  r = await call('GET', `/api/todos?roomId=${room.id}`, { token: tokenC });
  check('멤버 아닌 사람 할 일 목록 404', r.status === 404);

  r = await call('PATCH', `/api/todos/${todo1.id}/status`, { token: tokenB, json: { isDone: true } });
  check(
    '친구가 추가한 일도 완료 표시 (완료한 사람 기록)',
    r.status === 200 && r.data.todo.isDone && r.data.todo.completedBy?.id === userB.id && Boolean(r.data.todo.doneAt),
  );
  r = await call('PATCH', `/api/todos/${todo1.id}/status`, { token: tokenB, json: { isDone: 'yes' } });
  check('완료 여부 형식 오류 400', r.status === 400);
  r = await call('GET', `/api/todos?roomId=${room.id}`, { token: tokenA });
  check('끝낸 일은 뒤로, 개수 갱신', r.data.items[1].id === todo1.id && r.data.counts.done === 1 && r.data.counts.open === 1);
  r = await call('PATCH', `/api/todos/${todo1.id}/status`, { token: tokenA, json: { isDone: false } });
  check(
    '완료 취소',
    r.status === 200 && !r.data.todo.isDone && r.data.todo.completedBy === null && r.data.todo.doneAt === null,
  );

  r = await call('PUT', `/api/todos/${todo2.id}`, { token: tokenA, json: { content: '남의 할 일 수정' } });
  check('남이 추가한 할 일 수정 403', r.status === 403);
  r = await call('PUT', `/api/todos/${todo2.id}`, {
    token: tokenB,
    json: { content: '사진 10장 인화하기', dueDate: '2026-11-20', assigneeId: userB.id },
  });
  check(
    '본인 할 일 수정',
    r.status === 200 && r.data.todo.content === '사진 10장 인화하기' && r.data.todo.assignee?.id === userB.id,
  );
  r = await call('DELETE', `/api/todos/${todo2.id}`, { token: tokenA });
  check('남이 추가한 할 일 삭제 403', r.status === 403);
  r = await call('PATCH', `/api/todos/${todo2.id}/status`, { token: tokenC, json: { isDone: true } });
  check('멤버 아닌 사람 완료 표시 404', r.status === 404);
  r = await call('PATCH', `/api/todos/${todo2.id}/status`, { token: tokenA, json: { isDone: true } });
  check('A가 B의 할 일 완료', r.status === 200 && r.data.todo.completedBy?.id === userA.id);

  const extra = await call('POST', '/api/todos', { token: tokenB, json: { roomId: room.id, content: '지울 할 일' } });
  r = await call('DELETE', `/api/todos/${extra.data.todo.id}`, { token: tokenB });
  check('본인 할 일 삭제 204', r.status === 204);

  console.log('\n[마이페이지]');
  r = await call('GET', '/api/users/me', { token: tokenA });
  check(
    '통계: 일기 1편, 받은 공감 1, 끝낸 할 일 1',
    r.status === 200 &&
      r.data.user.stats.diaryCount === 1 &&
      r.data.user.stats.likesReceived === 1 &&
      r.data.user.stats.todosDone === 1 &&
      r.data.user.rooms.length === 1,
    JSON.stringify(r.data.user?.stats),
  );
  r = await call('PUT', '/api/users/me', { token: tokenA, json: { nickname: '앨리스2', introduction: '매일 쓰는 사람' } });
  check('닉네임·자기소개 수정', r.status === 200 && r.data.user.nickname === '앨리스2' && r.data.user.introduction === '매일 쓰는 사람');
  r = await call('PUT', '/api/users/me', { token: tokenA, json: {} });
  check('빈 수정 요청 400', r.status === 400);

  const profileForm = new FormData();
  profileForm.append('image', new Blob([PNG], { type: 'image/png' }), 'me.png');
  r = await call('POST', '/api/users/me/profile-image', { token: tokenA, form: profileForm });
  check('프로필 사진 업로드', r.status === 200 && r.data.user.profileImage?.startsWith('/uploads/profiles/'));
  const firstProfile = r.data.user.profileImage;

  const profileForm2 = new FormData();
  profileForm2.append('image', new Blob([GIF], { type: 'image/gif' }), 'me2.gif');
  r = await call('POST', '/api/users/me/profile-image', { token: tokenA, form: profileForm2 });
  check('프로필 사진 교체 시 이전 파일 삭제', r.status === 200 && !uploadExists(firstProfile) && uploadExists(r.data.user.profileImage));

  r = await call('DELETE', '/api/users/me/profile-image', { token: tokenA });
  check('프로필 사진 기본으로', r.status === 200 && r.data.user.profileImage === null);

  console.log('\n[삭제와 공간 나가기]');
  r = await call('DELETE', `/api/diaries/${diary2.id}`, { token: tokenA });
  check('남의 일기 삭제 403', r.status === 403);
  r = await call('DELETE', `/api/diaries/${diary2.id}`, { token: tokenB });
  check('본인 일기 삭제 204', r.status === 204);

  const oldCode = room.inviteCode;
  r = await call('DELETE', `/api/rooms/${room.id}/members/me`, { token: tokenB });
  check('B 공간 나가기 (공간 유지)', r.status === 200 && r.data.roomDeleted === false);
  r = await call('GET', `/api/rooms/${room.id}`, { token: tokenA });
  check('남은 멤버 1명 + 초대 코드 재발급', r.data.room.members.length === 1 && r.data.room.inviteCode !== oldCode);
  r = await call('GET', `/api/diaries/${diary1.id}`, { token: tokenB });
  check('나간 사람은 일기 조회 불가 404', r.status === 404);
  r = await call('GET', `/api/todos?roomId=${room.id}`, { token: tokenA });
  check(
    '나간 사람이 맡았던 할 일은 함께 하는 일로',
    r.status === 200 && r.data.items.find((t) => t.id === todo1.id)?.assignee === null,
  );

  r = await call('DELETE', `/api/rooms/${room.id}/members/me`, { token: tokenA });
  check('마지막 멤버 나가기 → 공간 삭제', r.status === 200 && r.data.roomDeleted === true);
  check('공간 삭제 시 사진 파일도 삭제', diary1Updated.images.every((img) => !uploadExists(img.imageUrl)));

  console.log('\n[동시 참여 경쟁]');
  r = await call('POST', '/api/rooms', { token: tokenA, json: { name: '경쟁 테스트' } });
  const raceRoom = r.data.room;
  const [joinB, joinC] = await Promise.all([
    call('POST', '/api/rooms/join', { token: tokenB, json: { inviteCode: raceRoom.inviteCode } }),
    call('POST', '/api/rooms/join', { token: tokenC, json: { inviteCode: raceRoom.inviteCode } }),
  ]);
  const statuses = [joinB.status, joinC.status].sort().join(',');
  check('동시에 두 명이 참여해도 한 명만 성공 (201,409)', statuses === '201,409', statuses);
  r = await call('GET', `/api/rooms/${raceRoom.id}`, { token: tokenA });
  check('공간 인원은 정확히 2명', r.data.room.members.length === 2);
  for (const token of [tokenA, tokenB, tokenC]) {
    await call('DELETE', `/api/rooms/${raceRoom.id}/members/me`, { token });
  }

  r = await call('GET', '/api/nope', { token: tokenA });
  check('없는 API 404', r.status === 404);

  console.log(`\n결과: ${passed}개 통과, ${failed}개 실패`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('테스트 실행 중 오류:', error);
  process.exit(1);
});
