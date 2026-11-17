/* eslint-disable no-console */
// 체험용 데이터: 서로 연결된 두 계정 + 공유 공간 + 일기·댓글·공감
// 실행: npm run db:seed   (여러 번 실행해도 계정이 중복 생성되지 않음)
//
// 체험 계정 (로컬 개발용 테스트 값)
//   haru@deardays.test  / diary1234  (닉네임: 하루)
//   byeol@deardays.test / diary1234  (닉네임: 별이)

import '../src/config/env.js'; // backend/.env 의 DATABASE_URL 불러오기
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { BCRYPT_ROUNDS } from '../src/config/constants.js';
import { generateInviteCode } from '../src/utils/inviteCode.js';

const prisma = new PrismaClient();
const PASSWORD = 'diary1234';

const day = (offset) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - offset);
  return date;
};

async function upsertUser(email, nickname, introduction) {
  const password = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, nickname, introduction, password },
  });
}

async function main() {
  const haru = await upsertUser('haru@deardays.test', '하루', '노을과 도서관을 좋아해요.');
  const byeol = await upsertUser('byeol@deardays.test', '별이', '비 오는 날 카페 탐방 중.');

  const existing = await prisma.diaryRoom.findFirst({
    where: { AND: [{ members: { some: { userId: haru.id } } }, { members: { some: { userId: byeol.id } } }] },
  });
  if (existing) {
    console.log(`이미 체험용 공간이 있어요: '${existing.name}' (초대 코드 ${existing.inviteCode})`);
    return;
  }

  const room = await prisma.diaryRoom.create({
    data: {
      name: '하루와 별이의 교환일기',
      inviteCode: generateInviteCode(),
      members: { create: [{ userId: haru.id }, { userId: byeol.id }] },
    },
  });

  const entries = [
    {
      author: byeol,
      title: '비 오는 날의 카페',
      content: '오늘은 하루 종일 비가 왔다.\n창가 자리에 앉아 한참 비를 구경했다.\n\n다음엔 하루랑 같이 가고 싶다. 딸기 라떼가 정말 맛있었어!',
      offset: 3,
    },
    {
      author: haru,
      title: '도서관 노을',
      content: '과제를 하다가 고개를 들었더니 창밖이 온통 분홍색이었다.\n별이도 같은 하늘을 봤을까?',
      offset: 2,
    },
    {
      author: byeol,
      title: '처음 해 본 일',
      content: '오늘 처음으로 혼자 영화를 봤다. 생각보다 괜찮았어.\n팝콘은 다 못 먹었지만.',
      offset: 1,
    },
    {
      author: haru,
      title: '주말 계획',
      content: '토요일 오후 2시, 그 카페에서 만나기로 했다.\n벌써 기대된다.',
      offset: 0,
    },
  ];

  for (const entry of entries) {
    const diary = await prisma.diary.create({
      data: {
        diaryRoomId: room.id,
        authorId: entry.author.id,
        title: entry.title,
        content: entry.content,
        diaryDate: day(entry.offset),
      },
    });
    const friend = entry.author.id === haru.id ? byeol : haru;
    await prisma.like.create({ data: { diaryId: diary.id, userId: friend.id } });
    await prisma.comment.create({
      data: { diaryId: diary.id, userId: friend.id, content: entry.author.id === haru.id ? '나도 보고 싶었어!' : '다음엔 꼭 같이 가자 :)' },
    });
  }

  console.log(`체험용 공간 '${room.name}'을 만들었어요. (일기 ${entries.length}편)`);
  console.log('로그인: haru@deardays.test 또는 byeol@deardays.test / 비밀번호 diary1234');
}

main()
  .catch((error) => {
    console.error('시드 데이터 생성 실패:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
