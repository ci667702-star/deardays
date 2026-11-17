import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { assetUrl } from '../../services/api.js';
import Button from '../ui/Button.jsx';
import Dialog from '../ui/Dialog.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';

/** 일기 사진 썸네일 + 크게 보기(그림판 스타일 창). 좌우 화살표 키로 넘긴다. */
export default function PhotoGallery({ images, title }) {
  const [index, setIndex] = useState(null);
  const open = index !== null;
  const count = images.length;

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') setIndex((i) => (i + 1) % count);
      if (event.key === 'ArrowLeft') setIndex((i) => (i - 1 + count) % count);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, count]);

  if (count === 0) return null;

  return (
    <>
      <ul className={count === 1 ? 'grid grid-cols-1' : 'grid grid-cols-2 gap-2 sm:grid-cols-3'}>
        {images.map((image, i) => (
          <li key={image.id}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="block w-full bg-hilite p-1 shadow-[var(--bevel-thin-in)] hover:bg-lav-soft"
              aria-label={`사진 ${i + 1} 크게 보기`}
            >
              <img
                src={assetUrl(image.imageUrl)}
                alt=""
                loading="lazy"
                className={count === 1 ? 'max-h-[420px] w-full object-contain' : 'aspect-square w-full object-cover'}
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={open}
        onClose={() => setIndex(null)}
        width={880}
        title={`${title} - 사진 ${open ? index + 1 : 0}/${count}`}
        icon={<PixelIcon name="folder" size={14} />}
        bodyClassName="p-2"
      >
        {open && (
          <div className="flex flex-col gap-2">
            <div className="sunken grid min-h-[240px] place-items-center bg-[#fff]">
              <img
                src={assetUrl(images[index].imageUrl)}
                alt={`${title}의 사진 ${index + 1}`}
                className="max-h-[70dvh] w-auto max-w-full object-contain"
              />
            </div>
            {count > 1 && (
              <div className="flex items-center justify-between gap-2">
                <Button size="sm" onClick={() => setIndex((i) => (i - 1 + count) % count)} icon={<ChevronLeft size={14} />}>
                  이전
                </Button>
                <span className="font-small text-[12px] text-muted">
                  {index + 1} / {count}
                </span>
                <Button size="sm" onClick={() => setIndex((i) => (i + 1) % count)}>
                  다음 <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}
