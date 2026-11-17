import { useState } from 'react';
import { assetUrl } from '../../services/api.js';
import { cx } from '../../utils/cx.js';

const TINTS = ['#f1ecfb', '#fde4ee', '#fff6e2', '#dcf1ea'];

/** 프로필 사진. 사진이 없거나 못 불러오면 닉네임 첫 글자를 파스텔 칸에 보여 준다. */
export default function Avatar({ user, size = 40, className }) {
  const src = assetUrl(user?.profileImage);
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = src && failedSrc !== src;
  const initial = (user?.nickname ?? '?').trim().charAt(0).toUpperCase();
  const tint = TINTS[(user?.id ?? 0) % TINTS.length];

  return (
    <span
      className={cx('sunken-thin inline-grid shrink-0 place-items-center overflow-hidden', className)}
      style={{ width: size, height: size, background: showImage ? '#fff' : tint, padding: 1 }}
      aria-hidden="true"
    >
      {showImage ? (
        <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" onError={() => setFailedSrc(src)} />
      ) : (
        <span className="leading-none text-title" style={{ fontSize: Math.round(size * 0.42) }}>
          {initial}
        </span>
      )}
    </span>
  );
}
