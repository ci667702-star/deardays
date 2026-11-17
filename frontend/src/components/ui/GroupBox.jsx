import { cx } from '../../utils/cx.js';

/** 옛 설정 창의 '그룹 상자' (홈 파인 테두리 + 제목) */
export default function GroupBox({ title, children, className }) {
  return (
    <fieldset className={cx('groupbox', className)}>
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}
