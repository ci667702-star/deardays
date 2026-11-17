import Button from './Button.jsx';
import Dialog from './Dialog.jsx';
import PixelIcon from './PixelIcon.jsx';

/** 옛 메시지 상자: 경고 아이콘 + 문구 + [확인] [취소] */
export default function ConfirmDialog({
  open,
  title = '확인',
  message,
  detail,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog
      open={open}
      title={title}
      onClose={loading ? undefined : onCancel}
      width={420}
      footer={
        <>
          <Button variant={danger ? 'danger' : 'default'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
          <Button onClick={onCancel} disabled={loading} autoFocus>
            {cancelLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <PixelIcon name="warning" size={32} className="mt-1" />
        <div className="min-w-0">
          <p>{message}</p>
          {detail && <p className="hint mt-2 text-[12px]">{detail}</p>}
        </div>
      </div>
    </Dialog>
  );
}
