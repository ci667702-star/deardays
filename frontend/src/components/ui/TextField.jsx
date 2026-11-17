import { useId } from 'react';
import { cx } from '../../utils/cx.js';

/**
 * 라벨 + 오목한 입력칸 + 안내/오류 문구.
 * as="textarea" 로 여러 줄 입력칸으로 쓸 수 있다.
 * hintTone: 'ok' 이면 안내 문구를 초록색으로 (예: 사용할 수 있는 이메일)
 */
export default function TextField({
  label,
  hint,
  hintTone,
  error,
  id,
  className,
  inputClassName,
  as: Component = 'input',
  ...props
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const message = error || hint;
  const messageId = message ? `${fieldId}-message` : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="label">
          {label}
        </label>
      )}
      <Component
        id={fieldId}
        className={cx('field', inputClassName)}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        {...props}
      />
      {message && (
        <p id={messageId} className={cx('hint', error ? 'hint--error' : hintTone === 'ok' && 'hint--ok')}>
          {message}
        </p>
      )}
    </div>
  );
}
