import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRooms } from '../../context/RoomContext.jsx';
import { useClock } from '../../hooks/useClock.js';
import { assetUrl } from '../../services/api.js';
import { diaryService } from '../../services/diaryService.js';
import { readScreensaver } from '../../utils/screensaver.js';
import PixelIcon from '../ui/PixelIcon.jsx';

const MAX_ITEMS = 7;
const timeFormat = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' });

/** 공간에 올린 사진과 낙서 주소를 모은다 (최근 일기 50편에서) */
async function loadPictures(roomId) {
  if (!roomId) return [];
  try {
    const { items } = await diaryService.list({ roomId, limit: 50 });
    const urls = items.flatMap((diary) => [...diary.images.map((image) => image.imageUrl), diary.doodleUrl].filter(Boolean));
    // 섞어서 몇 장만
    for (let i = urls.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [urls[i], urls[j]] = [urls[j], urls[i]];
    }
    return urls.slice(0, MAX_ITEMS).map(assetUrl);
  } catch {
    return [];
  }
}

/** 화면 가장자리에 부딪히면 튕기며 떠다니는 사진들 */
function Floaters({ pictures }) {
  const layerRef = useRef(null);
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return undefined;
    const nodes = [...layer.children];
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const items = nodes.map((node) => {
      const size = node.getBoundingClientRect();
      const speed = reduce ? 0 : 40 + Math.random() * 50; // px/초
      const angle = Math.random() * Math.PI * 2;
      return {
        node,
        w: size.width,
        h: size.height,
        x: Math.random() * Math.max(1, W() - size.width),
        y: Math.random() * Math.max(1, H() - size.height),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      };
    });
    let last = performance.now();
    let frame;
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (const item of items) {
        item.x += item.vx * dt;
        item.y += item.vy * dt;
        if (item.x < 0 || item.x + item.w > W()) {
          item.vx *= -1;
          item.x = Math.max(0, Math.min(item.x, W() - item.w));
        }
        if (item.y < 0 || item.y + item.h > H()) {
          item.vy *= -1;
          item.y = Math.max(0, Math.min(item.y, H() - item.h));
        }
        item.node.style.transform = `translate(${item.x}px, ${item.y}px)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [pictures, reduce]);

  return (
    <div ref={layerRef} className="absolute inset-0">
      {pictures.length > 0
        ? pictures.map((src, index) => (
            <div key={`${src}-${index}`} className="absolute left-0 top-0 bg-[#ffffff] p-[6px] pb-5 shadow-[4px_4px_0_rgb(0_0_0/0.45)]" style={{ width: 'min(30vw, 190px)' }}>
              <img src={src} alt="" className="block aspect-square w-full object-cover" draggable={false} />
            </div>
          ))
        : Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="absolute left-0 top-0" aria-hidden="true">
              <PixelIcon name="heart" size={64} />
            </div>
          ))}
    </div>
  );
}

/**
 * 화면 보호기: 정해 둔 시간 동안 아무 입력이 없으면 우리 사진이 화면을 떠다닌다.
 * 마우스를 움직이거나 키를 누르거나 화면을 누르면 꺼진다.
 */
export default function ScreenSaver() {
  const { currentRoom } = useRooms();
  const [settings, setSettings] = useState(readScreensaver);
  const [active, setActive] = useState(false);
  const [pictures, setPictures] = useState([]);
  const timerRef = useRef(null);
  const startPoint = useRef(null);
  const now = useClock();

  const start = useCallback(async () => {
    setPictures(await loadPictures(currentRoom?.id));
    startPoint.current = null;
    setActive(true);
  }, [currentRoom?.id]);

  // 설정 바뀜 / 미리 보기
  useEffect(() => {
    const onChange = (event) => setSettings(event.detail);
    const onPreview = () => start();
    window.addEventListener('deardays:screensaver', onChange);
    window.addEventListener('deardays:screensaver-preview', onPreview);
    return () => {
      window.removeEventListener('deardays:screensaver', onChange);
      window.removeEventListener('deardays:screensaver-preview', onPreview);
    };
  }, [start]);

  // 가만히 있는 시간 재기
  useEffect(() => {
    if (!settings.enabled || active) return undefined;
    const reset = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (document.visibilityState === 'visible') start();
      }, settings.minutes * 60 * 1000);
    };
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
    events.forEach((name) => window.addEventListener(name, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timerRef.current);
      events.forEach((name) => window.removeEventListener(name, reset));
    };
  }, [settings, active, start]);

  // 켜져 있을 때: 움직임이 느껴지면 끈다 (손떨림 정도의 작은 움직임은 무시)
  useEffect(() => {
    if (!active) return undefined;
    const stop = () => setActive(false);
    const onMove = (event) => {
      if (!startPoint.current) {
        startPoint.current = { x: event.clientX, y: event.clientY };
        return;
      }
      if (Math.abs(event.clientX - startPoint.current.x) + Math.abs(event.clientY - startPoint.current.y) > 12) stop();
    };
    // 화면 보호기를 끄는 클릭·키가 뒤의 화면을 누르지 않게 막는다
    const swallow = (event) => {
      event.preventDefault();
      event.stopPropagation();
      stop();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', swallow, true);
    window.addEventListener('keydown', swallow, true);
    window.addEventListener('touchstart', swallow, { capture: true, passive: false });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', swallow, true);
      window.removeEventListener('keydown', swallow, true);
      window.removeEventListener('touchstart', swallow, { capture: true });
    };
  }, [active]);

  if (!active) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] cursor-none overflow-hidden bg-[#000000]" role="presentation" aria-hidden="true">
      <Floaters pictures={pictures} />
      <div className="font-small pointer-events-none absolute bottom-4 right-5 text-right text-[#ffffff] opacity-70">
        <p className="text-[28px] leading-none">{timeFormat.format(now)}</p>
        <p className="mt-1 text-[12px]">DearDays · 마우스를 움직이면 돌아가요</p>
      </div>
    </div>,
    document.body,
  );
}
