import { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser, PaintBucket, Pencil, Trash2, Undo2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { assetUrl } from '../../services/api.js';
import { cx } from '../../utils/cx.js';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import Dialog from '../ui/Dialog.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';

// 도트 낙서 크기. 화면에서는 늘려 보여 주되 픽셀이 번지지 않게 그린다 (index.css 의 .doodle-canvas)
const W = 320;
const H = 200;
const HISTORY_MAX = 30;

const COLORS = [
  '#000000', '#808080', '#c0c0c0', '#ffffff',
  '#e0303a', '#f37aa9', '#f08a24', '#f5d63d',
  '#7bd14a', '#1f8a4c', '#6fd3c0', '#6aaef0',
  '#2f5bd3', '#23205e', '#8e4fd0', '#8a5a33',
];

const SIZES = [1, 2, 4, 8];

const TOOLS = [
  { id: 'pen', label: '연필', icon: Pencil },
  { id: 'eraser', label: '지우개', icon: Eraser },
  { id: 'fill', label: '채우기', icon: PaintBucket },
];

const hexToRgb = (hex) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));

/** 같은 색으로 이어진 칸을 한 번에 칠한다. 칠한 게 없으면 false */
function floodFill(ctx, x, y, hex) {
  if (x < 0 || y < 0 || x >= W || y >= H) return false;
  const image = ctx.getImageData(0, 0, W, H);
  const d = image.data;
  const [r, g, b] = hexToRgb(hex);
  const start = (y * W + x) * 4;
  const [tr, tg, tb, ta] = [d[start], d[start + 1], d[start + 2], d[start + 3]];
  if (tr === r && tg === g && tb === b && ta === 255) return false;

  const matches = (i) => d[i] === tr && d[i + 1] === tg && d[i + 2] === tb && d[i + 3] === ta;
  const stack = [y * W + x];
  while (stack.length) {
    const p = stack.pop();
    const i = p * 4;
    if (!matches(i)) continue;
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
    d[i + 3] = 255;
    const px = p % W;
    if (px > 0) stack.push(p - 1);
    if (px < W - 1) stack.push(p + 1);
    if (p >= W) stack.push(p - W);
    if (p < W * (H - 1)) stack.push(p + W);
  }
  ctx.putImageData(image, 0, 0);
  return true;
}

function isBlank(ctx) {
  const d = ctx.getImageData(0, 0, W, H).data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] !== 255 || d[i + 1] !== 255 || d[i + 2] !== 255) return false;
  }
  return true;
}

/** 그림 그리는 칸 + 도구. 다 그리면 onDone(PNG Blob), 아무것도 안 그렸으면 onDone(null) */
function DoodleEditor({ initialSrc, onDone, onDirtyChange }) {
  const toast = useToast();
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const historyRef = useRef([]);
  const lastRef = useRef(null);
  const [tool, setTool] = useState('pen');
  const [size, setSize] = useState(2);
  const [color, setColor] = useState('#000000');
  const [canUndo, setCanUndo] = useState(false);
  const [loading, setLoading] = useState(Boolean(initialSrc));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctxRef.current = ctx;
    if (!initialSrc) return;

    // 전에 그린 낙서를 불러와 이어 그린다
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      ctx.drawImage(image, 0, 0, W, H);
      setLoading(false);
    };
    image.onerror = () => {
      setLoading(false);
      toast.error('전에 그린 낙서를 불러오지 못했어요. 새로 그려 주세요.');
    };
    image.src = initialSrc;
  }, [initialSrc, toast]);

  const remember = () => {
    historyRef.current.push(ctxRef.current.getImageData(0, 0, W, H));
    if (historyRef.current.length > HISTORY_MAX) historyRef.current.shift();
    setCanUndo(true);
    onDirtyChange(true);
  };

  const undo = useCallback(() => {
    const previous = historyRef.current.pop();
    if (previous) ctxRef.current.putImageData(previous, 0, 0);
    setCanUndo(historyRef.current.length > 0);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [undo]);

  const pointOf = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: Math.floor(((event.clientX - rect.left) * W) / rect.width),
      y: Math.floor(((event.clientY - rect.top) * H) / rect.height),
    };
  };

  const dab = (x, y) => {
    const ctx = ctxRef.current;
    const half = Math.floor(size / 2);
    ctx.fillStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.fillRect(x - half, y - half, size, size);
  };

  // 두 점 사이를 빈틈없이 잇는다 (브레젠험 직선)
  const line = (from, to) => {
    let { x, y } = from;
    const dx = Math.abs(to.x - x);
    const dy = -Math.abs(to.y - y);
    const sx = x < to.x ? 1 : -1;
    const sy = y < to.y ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      dab(x, y);
      if (x === to.x && y === to.y) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  };

  const onPointerDown = (event) => {
    if (loading || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    const point = pointOf(event);
    remember();
    if (tool === 'fill') {
      if (!floodFill(ctxRef.current, point.x, point.y, color)) undo();
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    lastRef.current = point;
    dab(point.x, point.y);
  };

  const onPointerMove = (event) => {
    if (!lastRef.current) return;
    const events = event.nativeEvent.getCoalescedEvents?.() ?? [event];
    for (const item of events.length ? events : [event]) {
      const point = pointOf(item);
      line(lastRef.current, point);
      lastRef.current = point;
    }
  };

  const stop = () => {
    lastRef.current = null;
  };

  const clearAll = () => {
    remember();
    const ctx = ctxRef.current;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
  };

  const finish = () => {
    if (isBlank(ctxRef.current)) {
      onDone(null);
      return;
    }
    setSaving(true);
    canvasRef.current.toBlob((blob) => {
      setSaving(false);
      if (blob) onDone(blob);
      else toast.error('낙서를 저장하지 못했어요. 다시 시도해 주세요.');
    }, 'image/png');
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex gap-1" role="group" aria-label="도구">
          {TOOLS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className="btn btn--sm btn--icon min-h-[34px] min-w-[34px]"
              aria-pressed={tool === id}
              onClick={() => setTool(id)}
              title={label}
              style={tool === id ? { boxShadow: 'var(--bevel-pressed)', background: 'var(--color-light)' } : undefined}
            >
              <Icon size={16} aria-hidden="true" />
              <span className="sr-only">{label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1" role="group" aria-label="굵기">
          {SIZES.map((value) => (
            <button
              key={value}
              type="button"
              className="btn btn--sm btn--icon min-h-[34px] min-w-[34px]"
              aria-pressed={size === value}
              onClick={() => setSize(value)}
              title={`굵기 ${value}`}
              disabled={tool === 'fill'}
              style={size === value ? { boxShadow: 'var(--bevel-pressed)', background: 'var(--color-light)' } : undefined}
            >
              <span className="block bg-current" style={{ width: value + 2, height: value + 2 }} aria-hidden="true" />
              <span className="sr-only">굵기 {value}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1">
          <Button size="sm" onClick={undo} disabled={!canUndo} icon={<Undo2 size={14} />} title="되돌리기 (Ctrl+Z)">
            되돌리기
          </Button>
          <Button size="sm" onClick={clearAll} icon={<Trash2 size={14} />}>
            모두 지우기
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-1.5 sm:flex sm:flex-wrap" role="group" aria-label="색">
        {COLORS.map((value) => (
          <button
            key={value}
            type="button"
            className="swatch"
            style={{ background: value }}
            aria-pressed={color === value}
            onClick={() => {
              setColor(value);
              if (tool === 'eraser') setTool('pen');
            }}
            title={value}
          >
            <span className="sr-only">색 {value}</span>
          </button>
        ))}
      </div>

      <div className="sunken relative mx-auto w-full max-w-[640px] p-[2px]">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className={cx('doodle-canvas', tool === 'fill' && 'cursor-cell')}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stop}
          onPointerCancel={stop}
          onLostPointerCapture={stop}
          aria-label="낙서 그리는 칸. 마우스나 손가락으로 그려요."
          role="img"
        />
        {loading && (
          <p className="font-small absolute inset-0 grid place-items-center bg-[rgb(255_255_255/0.7)] text-[12px]">불러오는 중...</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="font-small mr-auto text-[12px] text-muted">
          {W}×{H} 도트. 일기에 한 장 붙일 수 있어요.
        </span>
        <Button variant="default" onClick={finish} loading={saving}>
          일기에 붙이기
        </Button>
      </div>
    </div>
  );
}

/**
 * 낙서 창(대화상자). 그리던 중에 닫으려 하면 한 번 묻는다.
 * onDone(blob | null): null 이면 빈 그림
 */
export function DoodlePad({ open, initialSrc, onClose, onDone }) {
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    if (open) setDirty(false);
  }, [open]);

  const requestClose = () => {
    if (dirty) setConfirmClose(true);
    else onClose();
  };

  return (
    <>
      <Dialog open={open} title="낙서 창" icon={<PixelIcon name="pencil" size={14} />} onClose={requestClose} width={700}>
        {open && <DoodleEditor initialSrc={initialSrc} onDone={onDone} onDirtyChange={setDirty} />}
      </Dialog>
      <ConfirmDialog
        open={confirmClose}
        title="낙서 창 닫기"
        message="그리던 낙서를 붙이지 않고 닫을까요?"
        detail="지금 그린 내용은 사라져요."
        confirmLabel="닫기"
        cancelLabel="계속 그리기"
        danger
        onConfirm={() => {
          setConfirmClose(false);
          onClose();
        }}
        onCancel={() => setConfirmClose(false)}
      />
    </>
  );
}

/**
 * 일기 쓰기 화면의 낙서 칸.
 * value: null | { src, blob } (blob 은 새로 그린 그림, 서버에 있던 그림이면 null)
 */
export function DoodleField({ value, onChange }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const done = (blob) => {
    setOpen(false);
    if (!blob) {
      toast.info('아무것도 그리지 않아서 붙이지 않았어요.');
      return;
    }
    onChange({ src: URL.createObjectURL(blob), blob });
  };

  return (
    <div>
      <span className="label">낙서</span>
      {value ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="sunken w-full max-w-[320px] p-[2px]">
            <img src={value.src} alt="붙인 낙서" className="doodle-img" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setOpen(true)} icon={<Pencil size={14} />}>
              다시 그리기
            </Button>
            <Button size="sm" onClick={() => onChange(null)}>
              빼기
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 border-2 border-dashed border-shade px-3 py-4 text-[13px] text-muted hover:bg-lav-soft"
        >
          <PixelIcon name="pencil" size={24} />
          <span className="font-small">낙서 그리기 (선택)</span>
        </button>
      )}
      <DoodlePad open={open} initialSrc={value?.src ?? null} onClose={() => setOpen(false)} onDone={done} />
    </div>
  );
}

/** 일기에 붙은 낙서 보기 */
export function DoodleView({ url, title }) {
  return (
    <figure className="max-w-[640px]">
      <div className="sunken p-[2px]">
        <img src={assetUrl(url)} alt={`${title}에 그린 낙서`} loading="lazy" decoding="async" className="doodle-img" />
      </div>
      <figcaption className="font-small mt-1 flex items-center gap-1 text-[12px] text-muted">
        <PixelIcon name="pencil" size={14} /> 낙서
      </figcaption>
    </figure>
  );
}
