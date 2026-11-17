import { Link } from 'react-router';
import { cx } from '../../utils/cx.js';
import PixelIcon from './PixelIcon.jsx';

function buttonClass({ variant, size, iconOnly, className }) {
  return cx(
    'btn',
    variant && `btn--${variant}`,
    size === 'sm' && 'btn--sm',
    iconOnly && 'btn--icon',
    className,
  );
}

/**
 * 볼록 버튼.
 * variant: 'default'(기본 버튼 테두리) | 'accent'(연핑크) | 'danger'(빨간 글씨)
 * loading 이면 모래시계를 보여 주고 클릭을 막는다.
 */
export default function Button({
  variant,
  size,
  iconOnly,
  loading = false,
  icon,
  children,
  className,
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, iconOnly, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <PixelIcon name="hourglass" size={16} /> : icon}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, iconOnly, icon, children, className, ...props }) {
  return (
    <Link className={buttonClass({ variant, size, iconOnly, className })} {...props}>
      {icon}
      {children}
    </Link>
  );
}
