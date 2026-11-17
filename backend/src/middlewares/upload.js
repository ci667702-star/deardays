import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import sharp from 'sharp';
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

// 윈도우에서 처리한 원본을 바로 지울 수 있도록 sharp 의 파일 캐시를 끈다.
sharp.cache(false);

const IMAGE_PRESETS = {
  // 일기 사진: 긴 변 1600px 이하로 (작은 사진은 키우지 않음)
  diary: (pipeline) => pipeline.resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }),
  // 프로필 사진: 320x320 정사각형으로 잘라냄
  profile: (pipeline) => pipeline.resize(320, 320, { fit: 'cover', position: 'attention' }),
};

/**
 * 업로드한 사진 최적화.
 * - 촬영 방향(EXIF)대로 돌린 뒤 위치(GPS)를 포함한 메타데이터를 모두 지운다 (개인정보 보호)
 * - 크기를 줄이고 WebP 로 다시 저장해 용량을 크게 줄인다
 * - 움직이는 GIF 는 그대로 둔다
 * 처리한 파일로 req.files 의 경로를 바꿔 두므로, 이후 단계에서 실패해도 오류 처리기가 지운다.
 */
export function optimizeImages(preset) {
  const apply = IMAGE_PRESETS[preset];
  return async (req, _res, next) => {
    for (const file of collectRequestFiles(req)) {
      if (path.extname(file.filename).toLowerCase() === '.gif') continue;

      const target = file.path.replace(/\.[^.]+$/, '.webp');
      const output = target === file.path ? `${file.path}.tmp` : target;
      try {
        await apply(sharp(file.path, { failOn: 'error' }).rotate()).webp({ quality: 82 }).toFile(output);
      } catch {
        throw HttpError.badRequest('사진을 처리하지 못했어요. 다른 사진으로 다시 시도해 주세요.', 'IMAGE_PROCESS_FAILED');
      }
      await fsp.unlink(file.path).catch(() => {});
      if (output !== target) await fsp.rename(output, target);

      file.path = target;
      file.filename = path.basename(target);
      file.mimetype = 'image/webp';
      file.size = (await fsp.stat(target)).size;
    }
    next();
  };
}
