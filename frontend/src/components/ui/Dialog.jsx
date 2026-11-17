import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils/cx.js';

/**
 * 모달 대화상자. Esc 또는 바깥 클릭으로 닫히고, 닫히면 원래 포커스로 돌아간다.
 */
export default function Dialog({ open, title, icon, onClose, children, footer, width = 440, className, bodyClassName }) {
  const titleId = useId();
  const panelRef = useRef(null);
  // 부모가 매번 새 함수를 넘겨도 효과가 다시 실행되지 않도록 ref 로 보관
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current?.();
      // 포커스가 대화상자 밖으로 나가지 않게 가둔다
      if (event.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    // autoFocus 가 지정된 요소가 없다면 대화상자 자체에 포커스
    requestAnimationFrame(() => {
      if (panelRef.current && !panelRef.current.contains(document.activeElement)) panelRef.current.focus();
    });
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) previouslyFocused.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-[rgb(42_36_49/0.28)] p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx('win win-open max-h-[calc(100dvh-24px)] w-full overflow-auto outline-none', className)}
        style={{ maxWidth: width }}
      >
        <div className="win-title">
          <span className="flex min-w-0 items-center gap-1.5">
            {icon}
            <span id={titleId} className="truncate">
              {title}
            </span>
          </span>
          {onClose && (
            <button type="button" className="win-title-btn" onClick={onClose} aria-label="닫기">
              <svg width="9" height="9" viewBox="0 0 9 9" shapeRendering="crispEdges" aria-hidden="true">
                <path
                  d="M0 1h2v1h1v1h2V2h1V1h2v1H7v1H6v1H5v1h1v1h1v1h1v1H6V7H5V6H3v1H2v1H0V7h1V6h1V5h1V4H2V3H1V2H0z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
        </div>
        <div className={cx('p-4', bodyClassName)}>{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 px-4 pb-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
