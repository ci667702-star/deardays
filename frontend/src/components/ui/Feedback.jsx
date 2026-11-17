import { RefreshCw } from 'lucide-react';
import { cx } from '../../utils/cx.js';
import { getErrorMessage } from '../../utils/errors.js';
import Button from './Button.jsx';
import PixelIcon from './PixelIcon.jsx';

/** 불러오는 중: 모래시계 + 진행 막대 */
export function Loading({ label = '불러오는 중...', className, compact = false }) {
  return (
    <div role="status" className={cx('flex flex-col items-center gap-3 text-center', compact ? 'py-4' : 'py-10', className)}>
      <PixelIcon name="hourglass" size={compact ? 24 : 32} />
      <p className="font-small text-[12px] text-muted">{label}</p>
      {!compact && (
        <div className="progress w-48" aria-hidden="true">
          <span />
        </div>
      )}
    </div>
  );
}

/** 실패: 무엇이 잘못됐는지와 다시 시도할 방법 */
export function ErrorMessage({ error, message, onRetry, className }) {
  return (
    <div role="alert" className={cx('flex items-start gap-3 py-4', className)}>
      <PixelIcon name="warning" size={28} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <p>{message ?? getErrorMessage(error)}</p>
        {onRetry && (
          <Button size="sm" className="mt-2" onClick={onRetry} icon={<RefreshCw size={12} />}>
            다시 시도
          </Button>
        )}
      </div>
    </div>
  );
}

/** 비어 있음: 다음에 할 일을 안내 */
export function EmptyState({ icon = 'letter', title, description, action, className }) {
  return (
    <div className={cx('flex flex-col items-center gap-2 px-4 py-8 text-center', className)}>
      <PixelIcon name={icon} size={40} />
      <p className="mt-1">{title}</p>
      {description && <p className="font-small max-w-sm text-[12px] text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
