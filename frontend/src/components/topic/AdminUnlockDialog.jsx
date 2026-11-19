import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/adminService.js';
import { getErrorMessage } from '../../utils/errors.js';
import Button from '../ui/Button.jsx';
import Dialog from '../ui/Dialog.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';
import TextField from '../ui/TextField.jsx';

/** 서버에 정해 둔 관리자 비밀번호(ADMIN_PASSWORD)를 넣으면 이 계정이 관리자가 된다 */
export default function AdminUnlockDialog({ open, onClose }) {
  const { updateUser } = useAuth();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => {
    setPassword('');
    setError('');
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!password) {
      setError('관리자 비밀번호를 입력해 주세요.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const me = await adminService.unlock(password);
      updateUser({ isAdmin: me.isAdmin });
      toast.success('관리자가 되었어요. 오늘의 주제와 문의함을 볼 수 있어요.');
      close();
    } catch (err) {
      setError(getErrorMessage(err, '관리자 비밀번호를 확인하지 못했어요.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} title="관리자 모드" icon={<PixelIcon name="key" size={14} />} onClose={close} width={420}>
      <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
        <div className="flex items-start gap-3">
          <PixelIcon name="key" size={32} className="mt-1" />
          <p className="text-[14px]">
            서버에 정해 둔 관리자 비밀번호를 넣으면 이 계정으로 <b>오늘의 주제</b>를 편집하고 <b>문의함</b>을 볼 수 있어요.
          </p>
        </div>
        <TextField
          label="관리자 비밀번호"
          type="password"
          autoComplete="off"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={error}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button type="submit" variant="default" loading={busy}>
            확인
          </Button>
          <Button onClick={close}>취소</Button>
        </div>
      </form>
    </Dialog>
  );
}
