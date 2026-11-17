import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { assetUrl } from '../../services/api.js';
import { cx } from '../../utils/cx.js';
import { ACCEPT_ATTR, MAX_IMAGE_MB, MAX_IMAGES } from './imageRules.js';

/**
 * 사진 첨부 칸: 이미 올린 사진(existing) + 새로 고른 사진(newItems).
 * 클릭하거나 파일을 끌어다 놓아 추가하고, 각 사진의 ×로 뺀다.
 */
export default function ImageUploader({ existing = [], newItems = [], onAddFiles, onRemoveExisting, onRemoveNew, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const total = existing.length + newItems.length;
  const full = total >= MAX_IMAGES;

  const handleFiles = (fileList) => {
    const files = [...(fileList ?? [])];
    if (files.length) onAddFiles(files);
  };

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="label mb-0">사진</span>
        <span className="font-small text-[12px] text-muted">
          {total}/{MAX_IMAGES}장, 한 장에 {MAX_IMAGE_MB}MB까지
        </span>
      </div>
      <div
        className={cx('sunken p-2', dragging && 'outline-2 outline-dashed outline-pink')}
        onDragOver={(e) => {
          e.preventDefault();
          if (!full) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!full) handleFiles(e.dataTransfer.files);
        }}
      >
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {existing.map((image) => (
            <li key={`e-${image.id}`} className="relative aspect-square bg-light shadow-[var(--bevel-thin-in)]">
              <img src={assetUrl(image.imageUrl)} alt="첨부한 사진" className="h-full w-full object-cover p-[2px]" />
              <button
                type="button"
                className="win-title-btn absolute right-1 top-1"
                onClick={() => onRemoveExisting(image.id)}
                aria-label="이 사진 빼기"
              >
                <X size={11} strokeWidth={3} />
              </button>
            </li>
          ))}
          {newItems.map((item) => (
            <li key={item.key} className="relative aspect-square bg-light shadow-[var(--bevel-thin-in)]">
              <img src={item.preview} alt={`새 사진 ${item.file.name}`} className="h-full w-full object-cover p-[2px]" />
              <span className="font-small absolute bottom-1 left-1 bg-pink-soft px-1 text-[11px]">새 사진</span>
              <button
                type="button"
                className="win-title-btn absolute right-1 top-1"
                onClick={() => onRemoveNew(item.key)}
                aria-label={`${item.file.name} 빼기`}
              >
                <X size={11} strokeWidth={3} />
              </button>
            </li>
          ))}
          {!full && (
            <li className="aspect-square">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-full w-full flex-col items-center justify-center gap-1 border-2 border-dashed border-shade text-[12px] text-muted hover:bg-lav-soft"
              >
                <ImagePlus size={20} aria-hidden="true" />
                <span className="font-small">사진 추가</span>
              </button>
            </li>
          )}
        </ul>
        {total === 0 && (
          <p className="font-small mt-2 text-center text-[12px] text-muted">사진을 이곳에 끌어다 놓아도 돼요.</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      {error && <p className="hint hint--error whitespace-pre-line">{error}</p>}
    </div>
  );
}
