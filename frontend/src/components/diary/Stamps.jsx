import { useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { diaryService } from '../../services/diaryService.js';
import { getErrorMessage } from '../../utils/errors.js';
import { STAMPS, stampOf, stampPlacement } from '../../utils/stamps.js';
import { cx } from '../../utils/cx.js';

/** 잉크가 고르게 묻지 않은 느낌을 내는 SVG 필터 (도장 글자·테두리에 군데군데 빈틈) */
export function StampInkFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <filter id="stamp-ink" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.4 2.75" result="mask" />
        <feComposite in="SourceGraphic" in2="mask" operator="in" />
      </filter>
    </svg>
  );
}

/** 찍힌 도장 하나 */
export function StampMark({ stamp, index, fresh = false }) {
  const def = stampOf(stamp.kind);
  if (!def) return null;
  const place = stampPlacement(stamp.id, index);
  return (
    <span
      className={cx('stamp-mark', `stamp-mark--${def.shape}`, fresh && 'stamp-mark--new')}
      style={{
        '--stamp-color': def.color,
        '--stamp-rotate': `${place.rotate}deg`,
        right: place.right,
        bottom: place.bottom,
      }}
      title={`${stamp.user?.nickname ?? ''}님의 도장`}
    >
      {def.label}
    </span>
  );
}

/**
 * 종이 오른쪽 아래에 도장을 찍어 둔다. 종이 아래쪽 여백은 부모가 만들어 준다(STAMP_SPACE).
 * 화면을 읽는 사람을 위해 어떤 도장이 찍혔는지 글로도 알려 준다.
 */
export function StampLayer({ stamps, freshIds = [] }) {
  if (!stamps?.length) return null;
  // 가장 최근 도장이 가장 오른쪽(맨 위)에 오도록
  const ordered = [...stamps].reverse();
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[110px] overflow-hidden" aria-hidden="true">
        {ordered.map((stamp, index) => (
          <StampMark key={stamp.id} stamp={stamp} index={index} fresh={freshIds.includes(stamp.id)} />
        ))}
      </div>
      <p className="sr-only">
        찍힌 도장: {stamps.map((stamp) => `${stamp.user?.nickname ?? ''} ${stampOf(stamp.kind)?.label ?? ''}`).join(', ')}
      </p>
    </>
  );
}

/** 도장이 있을 때 종이 아래쪽에 더 두는 여백 */
export const STAMP_SPACE = 104;

/**
 * 친구 일기에 도장 찍기: 누르면 바로 찍히고, 한 번 더 누르면 뗀다.
 * onChange(stamps, freshId) 로 새 도장 목록을 알린다.
 */
export function StampPad({ diaryId, stamps, meId, onChange }) {
  const toast = useToast();
  const [busyKind, setBusyKind] = useState(null);
  const mineKinds = new Set(stamps.filter((stamp) => stamp.user?.id === meId).map((stamp) => stamp.kind));

  const toggle = async (kind) => {
    if (busyKind) return;
    setBusyKind(kind);
    const had = mineKinds.has(kind);
    try {
      const result = had ? await diaryService.unstamp(diaryId, kind) : await diaryService.stamp(diaryId, kind);
      const fresh = had ? null : result.stamps.find((stamp) => stamp.kind === kind && stamp.user?.id === meId)?.id;
      onChange(result.stamps, fresh ?? null);
    } catch (error) {
      toast.error(getErrorMessage(error, '도장을 찍지 못했어요.'));
    } finally {
      setBusyKind(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="도장 찍기">
      {STAMPS.map((stamp) => {
        const pressed = mineKinds.has(stamp.kind);
        return (
          <button
            key={stamp.kind}
            type="button"
            className="btn btn--sm min-h-[34px] px-1.5"
            aria-pressed={pressed}
            disabled={busyKind !== null}
            onClick={() => toggle(stamp.kind)}
            title={pressed ? `'${stamp.label}' 도장 떼기` : `'${stamp.label}' 도장 찍기`}
            style={pressed ? { boxShadow: 'var(--bevel-pressed)' } : undefined}
          >
            <span className="stamp-chip" style={{ color: stamp.color, opacity: pressed ? 1 : 0.8 }}>
              {stamp.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
