/* eslint-disable no-console */
// DearDays 도트 편지 아이콘을 PNG 로 그린다. (외부 도구 없이 Node 내장 zlib 만 사용)
//  - desktop/build/icon.png      : 데스크톱 앱 아이콘 (512x512, 투명 배경)
//  - desktop/build/badge.png     : 작업 표시줄 '안 읽은 소식' 표시 (32x32 빨간 점)
//  - frontend/public/icon-*.png  : 웹 앱 매니페스트·홈 화면 아이콘 (청록 바탕)
// 실행: npm run icons

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

// frontend/src/utils/pixelIcons.js 의 letter 와 같은 그림 (위아래 빈 줄 제외)
const LETTER = [
  'kkkkkkkkkkkkkkkk',
  'kkcccccccccccckk',
  'kckkcccccccckkck',
  'kccckkcccckkccck',
  'kccccckppkccccck',
  'kcccccppppccccck',
  'kccccccppcccccck',
  'kcccccccccccccck',
  'kcccccccccccccck',
  'kkkkkkkkkkkkkkkk',
];
const COLORS = { k: [42, 36, 49, 255], c: [255, 244, 214, 255], p: [233, 114, 159, 255] };

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let k = 0; k < 8; k += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return (~crc) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/** RGBA 픽셀 배열 → PNG 버퍼 */
function encodePng(width, height, pixels) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0;
    pixels.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // 8비트
  header[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** size 크기 캔버스에 편지 도트를 scale 배로, 가운데에 그린다 */
function drawLetter(size, scale, background) {
  const pixels = Buffer.alloc(size * size * 4);
  if (background) {
    for (let i = 0; i < size * size; i += 1) Buffer.from(background).copy(pixels, i * 4);
  }
  const w = LETTER[0].length * scale;
  const h = LETTER.length * scale;
  const offsetX = Math.floor((size - w) / 2);
  const offsetY = Math.floor((size - h) / 2);
  LETTER.forEach((row, ry) => {
    [...row].forEach((char, rx) => {
      const color = COLORS[char];
      if (!color) return;
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const x = offsetX + rx * scale + dx;
          const y = offsetY + ry * scale + dy;
          Buffer.from(color).copy(pixels, (y * size + x) * 4);
        }
      }
    });
  });
  return encodePng(size, size, pixels);
}

/** 작업 표시줄 위에 겹쳐 보이는 빨간 점 (흰 테두리) */
function drawBadge(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const center = (size - 1) / 2;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const d = Math.hypot(x - center, y - center);
      let color = null;
      if (d <= size / 2 - 0.5) color = [255, 255, 255, 255];
      if (d <= size / 2 - 3) color = [200, 16, 46, 255];
      if (color) Buffer.from(color).copy(pixels, (y * size + x) * 4);
    }
  }
  return encodePng(size, size, pixels);
}

const desktopBuild = path.resolve(__dirname, '..', 'build');
const frontendPublic = path.resolve(__dirname, '..', '..', 'frontend', 'public');
const TEAL = [0, 128, 128, 255];

const outputs = [
  [path.join(desktopBuild, 'icon.png'), drawLetter(512, 30)],
  [path.join(desktopBuild, 'badge.png'), drawBadge(32)],
  [path.join(frontendPublic, 'icon-192.png'), drawLetter(192, 8, TEAL)],
  [path.join(frontendPublic, 'icon-512.png'), drawLetter(512, 20, TEAL)],
  [path.join(frontendPublic, 'apple-touch-icon.png'), drawLetter(180, 8, TEAL)],
];

for (const [file, png] of outputs) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, png);
  console.log(`${path.relative(path.resolve(__dirname, '..', '..'), file)} (${png.length} bytes)`);
}
