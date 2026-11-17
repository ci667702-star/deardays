import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';
import { ALLOWED_IMAGE_TYPES, MAX_DIARY_IMAGES } from '../config/constants.js';
import { HttpError } from '../utils/HttpError.js';
import { collectRequestFiles } from '../utils/files.js';

function createImageUploader(subDir) {
  const destination = path.join(env.uploadDir, subDir);
  fs.mkdirSync(destination, { recursive: true });

  const storage = multer.diskStorage({
    destination,
    // 원본 파일명은 쓰지 않는다: 추측 불가능한 이름 + 검증된 확장자
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext === '.jpeg' ? '.jpg' : ext}`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: env.maxImageSizeMb * 1024 * 1024,
      files: MAX_DIARY_IMAGES,
      fields: 20,
    },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const allowedMimes = ALLOWED_IMAGE_TYPES[ext];
      if (!allowedMimes || !allowedMimes.includes(file.mimetype)) {
        cb(HttpError.badRequest('사진은 JPG, PNG, GIF, WEBP 파일만 올릴 수 있어요.', 'INVALID_FILE_TYPE'));
        return;
      }
      cb(null, true);
    },
  });
}

const diaryUploader = createImageUploader('diaries');
const profileUploader = createImageUploader('profiles');

export const uploadDiaryImages = diaryUploader.array('images', MAX_DIARY_IMAGES);
export const uploadProfileImage = profileUploader.single('image');

// 파일 앞부분의 시그니처(매직 넘버)로 실제 이미지인지 한 번 더 확인한다.
const SIGNATURES = {
  '.jpg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  '.png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  '.gif': (b) => b.subarray(0, 4).toString('ascii') === 'GIF8',
  '.webp': (b) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
};

async function readHead(filePath, length = 12) {
  const handle = await fsp.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(length);
    await handle.read(buffer, 0, length, 0);
    return buffer;
  } finally {
    await handle.close();
  }
}

export async function verifyImageSignatures(req, _res, next) {
  for (const file of collectRequestFiles(req)) {
    const ext = path.extname(file.filename).toLowerCase();
    const check = SIGNATURES[ext];
    const head = await readHead(file.path);
    if (!check || !check(head)) {
      throw HttpError.badRequest('이미지 파일이 손상되었거나 형식이 올바르지 않아요.', 'INVALID_FILE_CONTENT');
    }
  }
  next();
}
