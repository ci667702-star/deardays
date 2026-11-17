import { ICONS, PALETTE } from '../../utils/pixelIcons.js';
import { cx } from '../../utils/cx.js';

/** 문자열 격자로 정의한 도트 아이콘을 SVG로 그린다. 같은 색이 이어지면 하나의 사각형으로 합친다. */
export default function PixelIcon({ name, size = 16, palette, className, title }) {
  const rows = ICONS[name];
  if (!rows) return null;
  const colors = palette ? { ...PALETTE, ...palette } : PALETTE;
  const height = rows.length;
  const width = rows[0].length;

  const rects = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < width) {
      const char = row[x];
      let run = 1;
      while (x + run < width && row[x + run] === char) run += 1;
      if (char !== '.' && colors[char]) {
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={run} height={1} fill={colors[char]} />);
      }
      x += run;
    }
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={(size * height) / width}
      className={cx('pixel inline-block shrink-0', className)}
      shapeRendering="crispEdges"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {rects}
    </svg>
  );
}
