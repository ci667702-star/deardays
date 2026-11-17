import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { MAX_ROOM_MEMBERS } from '../config/constants.js';
import { HttpError } from '../utils/HttpError.js';
import { generateInviteCode } from '../utils/inviteCode.js';
import { diaryFileUrls, removeUploadUrls } from '../utils/files.js';
import { toRoom } from '../utils/serializers.js';
import { notify } from './notificationService.js';

const roomInclude = {
  members: { include: { user: true }, orderBy: { joinedAt: 'asc' } },
  _count: { select: { diaries: true } },
};

const ROOM_NOT_FOUND = () =>
  HttpError.notFound('공유 공간을 찾을 수 없거나 참여하지 않은 공간이에요.', 'ROOM_NOT_FOUND');

/** 사용자가 해당 공간의 멤버인지 확인한다. 아니면 공간의 존재 자체를 숨기고 404로 응답한다. */
export async function assertRoomMember(roomId, userId, db = prisma) {
  const membership = await db.diaryRoomMember.findUnique({
    where: { userId_diaryRoomId: { userId, diaryRoomId: roomId } },
  });
  if (!membership) throw ROOM_NOT_FOUND();
  return membership;
}

async function createUniqueInviteCode(db = prisma) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateInviteCode();
    const exists = await db.diaryRoom.findUnique({ where: { inviteCode: code }, select: { id: true } });
    if (!exists) return code;
  }
  throw new Error('초대 코드를 만들지 못했습니다.');
}

export async function createRoom(userId, { name }) {
  const inviteCode = await createUniqueInviteCode();
  const room = await prisma.diaryRoom.create({
    data: { name, inviteCode, members: { create: { userId } } },
    include: roomInclude,
  });
  return toRoom(room);
}

export async function joinRoom(userId, { inviteCode }) {
  const room = await prisma.$transaction(
    async (tx) => {
      // 두 사람이 동시에 같은 코드로 참여하는 경우를 막기 위해 공간 행을 먼저 잠근다.
      const [locked] = await tx.$queryRaw`
        SELECT id FROM diary_rooms WHERE inviteCode = ${inviteCode} FOR UPDATE`;
      if (!locked) {
        throw HttpError.notFound('존재하지 않는 초대 코드예요. 코드를 다시 확인해 주세요.', 'INVALID_INVITE_CODE');
      }
      const roomId = Number(locked.id);

      const members = await tx.diaryRoomMember.findMany({
        where: { diaryRoomId: roomId },
        select: { userId: true },
      });
      if (members.some((member) => member.userId === userId)) {
        throw HttpError.conflict('이미 참여하고 있는 공간이에요.', 'ALREADY_MEMBER');
      }
      if (members.length >= MAX_ROOM_MEMBERS) {
        throw HttpError.conflict('이미 두 사람이 함께 쓰고 있는 공간이라 참여할 수 없어요.', 'ROOM_FULL');
      }

      await tx.diaryRoomMember.create({ data: { userId, diaryRoomId: roomId } });
      return tx.diaryRoom.findUnique({ where: { id: roomId }, include: roomInclude });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
  );
  // 먼저 있던 친구에게 '들어왔어요' 알림
  await notify({ roomId: room.id, actorId: userId, type: 'MEMBER_JOINED' });
  return toRoom(room);
}

export async function listRooms(userId) {
  const rooms = await prisma.diaryRoom.findMany({
    where: { members: { some: { userId } } },
    include: roomInclude,
    orderBy: { createdAt: 'asc' },
  });
  return rooms.map((room) => toRoom(room));
}

export async function getRoom(roomId, userId) {
  await assertRoomMember(roomId, userId);
  const room = await prisma.diaryRoom.findUnique({ where: { id: roomId }, include: roomInclude });
  if (!room) throw ROOM_NOT_FOUND();
  return toRoom(room);
}

export async function renameRoom(roomId, userId, { name }) {
  await assertRoomMember(roomId, userId);
  const room = await prisma.diaryRoom.update({ where: { id: roomId }, data: { name }, include: roomInclude });
  return toRoom(room);
}

export async function regenerateInviteCode(roomId, userId) {
  await assertRoomMember(roomId, userId);
  const inviteCode = await createUniqueInviteCode();
  const room = await prisma.diaryRoom.update({ where: { id: roomId }, data: { inviteCode }, include: roomInclude });
  return toRoom(room);
}

/**
 * 공간에서 나간다.
 * - 마지막 멤버가 나가면 공간과 모든 일기·사진을 삭제한다.
 * - 한 명이 남으면 예전 초대 코드를 무효화하고 새 코드를 발급한다.
 *   나간 사람이 맡았던 할 일은 '함께' 하는 일이 된다.
 */
export async function leaveRoom(roomId, userId) {
  await assertRoomMember(roomId, userId);

  const result = await prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM diary_rooms WHERE id = ${roomId} FOR UPDATE`;
      await tx.diaryRoomMember.delete({
        where: { userId_diaryRoomId: { userId, diaryRoomId: roomId } },
      });

      const remaining = await tx.diaryRoomMember.count({ where: { diaryRoomId: roomId } });
      if (remaining === 0) {
        const fileUrls = await diaryFileUrls({ diaryRoomId: roomId }, tx);
        await tx.diaryRoom.delete({ where: { id: roomId } });
        return { roomDeleted: true, imageUrls: fileUrls };
      }

      // 나간 사람이 맡았던 할 일은 '함께' 하는 일로 돌린다.
      await tx.todo.updateMany({
        where: { diaryRoomId: roomId, assigneeId: userId },
        data: { assigneeId: null },
      });
      await tx.diaryRoom.update({
        where: { id: roomId },
        data: { inviteCode: await createUniqueInviteCode(tx) },
      });
      return { roomDeleted: false, imageUrls: [] };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
  );

  await removeUploadUrls(result.imageUrls);
  return { roomDeleted: result.roomDeleted };
}
