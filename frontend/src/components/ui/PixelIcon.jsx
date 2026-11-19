import { ICONS, PALETTE } from '../../utils/pixelIcons.js';
import { cx } from '../../utils/cx.js';

/**
 * 문자열 격자로 정의한 도트 그림을 SVG로 그린다. 같은 색이 이어지면 하나의 사각형으로 합친다.
 * - name: utils/pixelIcons.js 의 16x16 아이콘 이름
 * - rows: 격자를 직접 넘길 때 (바탕화면 아이콘·구름처럼 크기가 다른 그림)
 * - palette: 글자 → 색. 'var(--icon-2)' 같은 CSS 변수도 된다 (테마를 바꾸면 색이 같이 바뀐다)
 */
export default function PixelIcon({ name, rows: customRows, size = 16, palette, className, title, style }) {
  const rows = customRows ?? ICONS[name];
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
      const color = char !== '.' && colors[char];
      if (color) {
        // CSS 변수는 fill 속성으로는 안 먹는 브라우저가 있어 style 로 칠한다
        const paint = color.startsWith('var(') ? { style: { fill: color } } : { fill: color };
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={run} height={1} {...paint} />);
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
      style={style}
      shapeRendering="crispEdges"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {rects}
    </svg>
  );
}
