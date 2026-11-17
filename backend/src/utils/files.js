import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';

/**
 * '/uploads/...' 형태의 공개 URL을 실제 파일 경로로 바꾼다.
 * 업로드 폴더 밖을 가리키는 경로는 무시한다 (경로 조작 방지).
 */
export function uploadUrlToPath(url) {
  if (typeof url !== 'string' || !url.startsWith('/uploads/')) return null;
  const relative = url.slice('/uploads/'.length);
  const resolved = path.resolve(env.uploadDir, relative);
  if (!resolved.startsWith(env.uploadDir + path.sep)) return null;
  return resolved;
}

export function filePathToUploadUrl(filePath) {
  const relative = path.relative(env.uploadDir, filePath).split(path.sep).join('/');
  return `/uploads/${relative}`;
}

/** 파일 삭제 실패는 서비스 흐름을 막지 않도록 로그만 남긴다. */
export async function removeFiles(paths) {
  await Promise.all(
    paths.filter(Boolean).map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') console.warn('[files] 삭제 실패:', filePath, error.message);
      }
    }),
  );
}

export async function removeUploadUrls(urls) {
  await removeFiles(urls.map(uploadUrlToPath));
}

/** 요청 처리 중 multer가 저장한 파일 목록 */
export function collectRequestFiles(req) {
  const files = [];
  if (req.file) files.push(req.file);
  if (Array.isArray(req.files)) files.push(...req.files);
  else if (req.files && typeof req.files === 'object') files.push(...Object.values(req.files).flat());
  return files;
}
