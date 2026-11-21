// 앱 아이콘 만들기: frontend/public/icon-512.png (도트 편지 아이콘) → 안드로이드 해상도별 아이콘
// 실행: node android/scripts/make-icons.cjs  (backend 에 설치된 sharp 를 빌려 쓴다)
const path = require('node:path');
const sharp = require(path.join(__dirname, '../../backend/node_modules/sharp'));

const SOURCE = path.join(__dirname, '../../frontend/public/icon-512.png');
const RES = path.join(__dirname, '../app/src/main/res');
const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

// 도트 그림이 뭉개지지 않게 가장 가까운 픽셀로 늘리고 줄인다
const scaled = (size) => sharp(SOURCE).resize(size, size, { kernel: 'nearest' }).png().toBuffer();

async function main() {
  for (const [name, scale] of Object.entries(DENSITIES)) {
    const dir = path.join(RES, `mipmap-${name}`);
    const legacy = Math.round(48 * scale);
    const canvas = Math.round(108 * scale);

    // 안드로이드 7 이하: 네모 아이콘과 동그란 아이콘
    await sharp(await scaled(legacy)).toFile(path.join(dir, 'ic_launcher.png'));
    const circle = Buffer.from(`<svg width="${legacy}" height="${legacy}"><circle cx="${legacy / 2}" cy="${legacy / 2}" r="${legacy / 2}" fill="#fff"/></svg>`);
    await sharp(await scaled(legacy)).composite([{ input: circle, blend: 'dest-in' }]).toFile(path.join(dir, 'ic_launcher_round.png'));

    // 안드로이드 8 이상(적응형 아이콘): 108dp 캔버스 가운데에 편지가 안전 영역 안에 들어오게 83% 크기로
    const inner = Math.round(canvas * 0.83);
    const offset = Math.round((canvas - inner) / 2);
    await sharp({ create: { width: canvas, height: canvas, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: await scaled(inner), left: offset, top: offset }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));
  }
  console.log('icons ok');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
