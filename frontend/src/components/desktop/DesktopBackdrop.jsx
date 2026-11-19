import { memo } from 'react';
import { CLOUDS, CLOUD_PALETTE, SUN, SUN_PALETTE } from '../../utils/desktopArt.js';
import PixelIcon from '../ui/PixelIcon.jsx';

/**
 * 바탕화면 그림: 도트 하늘(띠 4개) + 해 + 구름 + 아래 구름 바다.
 * 구름 테마(벚꽃 하늘·파란 하늘)에서만 보이고, 단색 테마에서는 바탕색만 남는다.
 * 어느 그림을 보일지는 index.css 의 테마 블록(--show-*)이 정한다.
 * 클릭을 받지 않고 화면 뒤에 고정돼 있어서, 창이 많아도 방해하지 않는다.
 */

// 구름 자리. scale = 도트 한 칸의 화면 픽셀, drift = 천천히 좌우로 오가는 거리(px, 0 이면 좌우로는 가만히)
// bob = 위아래로 떠오르는 높이(px), bobTime = 한 번 올라가는 데 걸리는 시간(초), bobDelay = 서로 어긋나게 시작
const CLOUD_SPOTS = [
  { art: 'cloudBig', top: '8%', left: '4%', scale: 5, drift: 70, time: 46, bob: -10, bobTime: 5.5, bobDelay: 0 },
  { art: 'cloudSmall', top: '5%', left: '55%', scale: 4, drift: -46, time: 38, bob: -7, bobTime: 4.5, bobDelay: -2, wide: true },
  { art: 'cloudMid', top: '26%', left: '76%', scale: 5, drift: -60, time: 54, bob: -9, bobTime: 6.5, bobDelay: -4 },
  { art: 'cloudMid', top: '38%', left: '-4%', scale: 4, drift: 0, bob: -8, bobTime: 5, bobDelay: -1.5, wide: true },
  { art: 'cloudSmall', top: '53%', left: '38%', scale: 4, drift: 40, time: 62, bob: -6, bobTime: 4, bobDelay: -3, wide: true },
  { art: 'cloudBig', top: '64%', left: '70%', scale: 4, drift: 0, bob: -9, bobTime: 6, bobDelay: -2.5, wide: true },
];

// 띠 경계 (index.css 의 .backdrop 그라데이션 멈춤 지점과 같아야 한다)
const SEAMS = [
  { at: '22%', a: 'var(--sky-1)', b: 'var(--sky-2)' },
  { at: '44%', a: 'var(--sky-2)', b: 'var(--sky-3)' },
  { at: '68%', a: 'var(--sky-3)', b: 'var(--sky-4)' },
];

/** 열마다 높이가 다른 도트 땅. top(x) = 그 열의 윗면 y. 같은 높이가 이어지면 사각형 하나로 */
function columns(width, height, top, fill, key) {
  const rects = [];
  let x = 0;
  while (x < width) {
    const y = top(x);
    let run = 1;
    while (x + run < width && top(x + run) === y) run += 1;
    if (y < height) rects.push(<rect key={`${key}-${x}`} x={x} y={y} width={run} height={height - y} style={{ fill }} />);
    x += run;
  }
  return rects;
}

const FLOOR_W = 240;
const FLOOR_H = 48;

/** 화면 아래에 깔린 뭉게구름 바다 (뒤는 그늘색, 앞은 흰색). 크기가 다른 둥근 덩어리를 겹쳐 쌓는다 */
const SEA_BACK = [[6, 13], [30, 16], [58, 12], [84, 17], [112, 13], [140, 18], [168, 12], [194, 16], [222, 14], [246, 12]];
const SEA_FRONT = [[-4, 9], [14, 11], [36, 8], [52, 12], [74, 9], [94, 13], [118, 8], [134, 11], [156, 9], [178, 13], [200, 8], [216, 11], [238, 10]];

/** 둥근 덩어리들의 윗면: 열 x 에서 가장 높이 솟은 덩어리의 높이 */
const puffTop = (puffs, base) => (x) => {
  let top = base;
  for (const [cx, r] of puffs) {
    const dx = x + 0.5 - cx;
    if (dx * dx < r * r) top = Math.min(top, base - Math.sqrt(r * r - dx * dx));
  }
  return Math.round(top);
};

function CloudSea() {
  const back = puffTop(SEA_BACK, 40);
  const front = puffTop(SEA_FRONT, 45);
  return (
    <svg
      className="backdrop-floor pixel"
      viewBox={`0 0 ${FLOOR_W} ${FLOOR_H}`}
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {columns(FLOOR_W, FLOOR_H, back, 'var(--cloud-shade)', 'b')}
      {columns(FLOOR_W, FLOOR_H, front, 'var(--cloud)', 'f')}
    </svg>
  );
}

function DesktopBackdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      {SEAMS.map((seam) => (
        <span
          key={seam.at}
          className="backdrop-seam"
          style={{ top: `calc(${seam.at} - 4px)`, '--seam-a': seam.a, '--seam-b': seam.b }}
        />
      ))}

      <div className="backdrop-art">
        {/* 보이기·숨기기는 감싼 span 이 맡는다 (PixelIcon 의 inline-block 보다 앞서도록) */}
        <span className="backdrop-sun absolute right-[7%] top-[7%]">
          <PixelIcon rows={SUN} palette={SUN_PALETTE} size={SUN[0].length * 4} className="block" />
        </span>
        {CLOUD_SPOTS.map((spot, index) => {
          const rows = CLOUDS[spot.art];
          return (
            <span
              key={index}
              className={`backdrop-cloud ${spot.drift ? 'backdrop-cloud--drift' : ''} ${spot.wide ? 'hidden sm:block' : ''}`}
              style={{ top: spot.top, left: spot.left, '--drift': `${spot.drift}px`, '--drift-time': `${spot.time ?? 50}s` }}
            >
              <span
                className="backdrop-cloud-bob"
                style={{ '--bob': `${spot.bob}px`, '--bob-time': `${spot.bobTime}s`, '--bob-delay': `${spot.bobDelay}s` }}
              >
                <PixelIcon rows={rows} palette={CLOUD_PALETTE} size={rows[0].length * spot.scale} className="block" />
              </span>
            </span>
          );
        })}
      </div>

      <CloudSea />
    </div>
  );
}

export default memo(DesktopBackdrop);
