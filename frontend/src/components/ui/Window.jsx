import { useId, useState } from 'react';
import { cx } from '../../utils/cx.js';

function Glyph({ type }) {
  const paths = {
    minimize: 'M1 6h6v2H1z',
    maximize: 'M0 0h9v2H0zM0 2h1v6H0zM8 2h1v6H8zM0 7h9v1H0z',
    restore: 'M2 0h7v2H2zM8 2h1v4H8zM2 2h1v1H2zM0 3h7v2H0zM0 5h1v4H0zM6 5h1v4H6zM0 8h7v1H0z',
    close:
      'M0 1h2v1h1v1h2V2h1V1h2v1H7v1H6v1H5v1h1v1h1v1h1v1H6V7H5V6H3v1H2v1H0V7h1V6h1V5h1V4H2V3H1V2H0z',
  };
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" shapeRendering="crispEdges" aria-hidden="true">
      <path d={paths[type]} fill="currentColor" />
    </svg>
  );
}

/**
 * 옛 윈도우 창.
 * - 접기(_)·최대화(□) 버튼은 창 안에서 동작하고, 닫기(×)는 onClose 가 있을 때만 보인다.
 */
export default function Window({
  title,
  icon,
  children,
  toolbar,
  statusBar,
  onClose,
  closeLabel = '닫기',
  className,
  bodyClassName,
  collapsible = true,
  maximizable = true,
  animate = true,
  inactive = false,
  as: Tag = 'section',
}) {
  const titleId = useId();
  const [collapsed, setCollapsed] = useState(false);
  const [maximized, setMaximized] = useState(false);

  return (
    <Tag className={cx('win', maximized && 'win--max', animate && 'win-open', className)} aria-labelledby={titleId}>
      <header className={cx('win-title', inactive && 'win-title--inactive')}>
        <span className="flex min-w-0 items-center gap-1.5">
          {icon}
          <h2 id={titleId} className="truncate text-[12px] font-bold">
            {title}
          </h2>
        </span>
        <span className="flex shrink-0 items-center gap-0.5">
          {collapsible && (
            <button
              type="button"
              className="win-title-btn"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? '창 펼치기' : '창 접기'}
              aria-expanded={!collapsed}
              title={collapsed ? '펼치기' : '접기'}
            >
              <Glyph type="minimize" />
            </button>
          )}
          {maximizable && (
            <button
              type="button"
              className="win-title-btn"
              onClick={() => setMaximized((v) => !v)}
              aria-label={maximized ? '원래 크기로' : '최대화'}
              aria-pressed={maximized}
              title={maximized ? '원래 크기로' : '최대화'}
            >
              <Glyph type={maximized ? 'restore' : 'maximize'} />
            </button>
          )}
          {onClose && (
            <button type="button" className="win-title-btn ml-0.5" onClick={onClose} aria-label={closeLabel} title={closeLabel}>
              <Glyph type="close" />
            </button>
          )}
        </span>
      </header>

      {!collapsed && (
        <>
          {toolbar && <div className="win-toolbar">{toolbar}</div>}
          <div className={cx('min-w-0 flex-1 p-3 sm:p-4', bodyClassName)}>{children}</div>
          {statusBar && <footer className="win-status">{statusBar}</footer>}
        </>
      )}
    </Tag>
  );
}
