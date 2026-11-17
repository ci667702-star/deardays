import PixelIcon from '../ui/PixelIcon.jsx';
import { cx } from '../../utils/cx.js';

export default function Logo({ size = 'lg', className }) {
  const large = size === 'lg';
  return (
    <div className={cx('flex items-center', large ? 'gap-3' : 'gap-2', className)}>
      <PixelIcon name="letter" size={large ? 48 : 24} />
      <span className={cx('leading-none tracking-tight', large ? 'text-[30px]' : 'text-[15px]')}>DearDays</span>
    </div>
  );
}
