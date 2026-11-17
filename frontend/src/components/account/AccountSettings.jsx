import { useState } from 'react';
import { useNavigate } from 'react-router';
import { KeyRound, UserX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { userService } from '../../services/userService.js';
import { getErrorMessage } from '../../utils/errors.js';
import Button from '../ui/Button.jsx';
import Dialog from '../ui/Dialog.jsx';
import GroupBox from '../ui/GroupBox.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';
import TextField from '../ui/TextField.jsx';

const EMPTY = { currentPassword: '', newPassword: '', confirm: '' };

function validateNew(form) {
  const errors = {};
  if (!form.currentPassword) errors.currentPassword = '지금 비밀번호를 입력해 주세요.';
  if (!form.newPassword) errors.newPassword = '새 비밀번호를 입력해 주세요.';
  else if (form.newPassword.length < 8) errors.newPassword = '비밀번호는 8자 이상이어야 해요.';
  else if (form.newPassword.length > 64) errors.newPassword = '비밀번호는 64자 이하로 정해 주세요.';
  else if (!/[A-Za-z]/.test(form.newPassword) || !/\d/.test(form.newPassword))
    errors.newPassword = '영문과 숫자를 모두 넣어 주세요.';
  else if (form.newPassword === form.currentPassword) errors.newPassword = '지금과 다른 비밀번호로 정해 주세요.';
  if (!errors.newPassword && form.newPassword !== form.confirm) errors.confirm = '새 비밀번호가 서로 달라요.';
  return errors;
}

/** 내 정보: 비밀번호 바꾸기 + 회원 탈퇴 */
export default function AccountSettings() {
  const { replaceToken, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [changing, setChanging] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const changePassword = async (event) => {
    event.preventDefault();
    const next = validateNew(form);
    setErrors(next);
    if (Object.keys(next).length) return;
    setChanging(true);
    try {
      const token = await userService.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      replaceToken(token);
      setForm(EMPTY);
      toast.success('비밀번호를 바꿨어요. 다른 기기에서는 다시 로그인해야 해요.');
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === 'WRONG_PASSWORD') setErrors({ currentPassword: err.response.data.message });
      else if (code === 'SAME_PASSWORD') setErrors({ newPassword: err.response.data.message });
      else toast.error(getErrorMessage(err));
    } finally {
      setChanging(false);
    }
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeletePassword('');
    setDeleteError('');
  };

  const deleteAccount = async (event) => {
    event?.preventDefault();
    if (!deletePassword) return setDeleteError('비밀번호를 입력해 주세요.');
    setDeleting(true);
    setDeleteError('');
    try {
      await userService.deleteAccount(deletePassword);
      logout();
      toast.info('탈퇴했어요. 그동안 DearDays를 써 주셔서 고마워요.');
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleteError(getErrorMessage(err));
      setDeleting(false);
    }
  };

  return (
    <>
      <GroupBox title="비밀번호 바꾸기">
        <form onSubmit={changePassword} noValidate className="flex flex-col gap-3">
          <TextField
            label="지금 비밀번호"
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={update('currentPassword')}
            error={errors.currentPassword}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="새 비밀번호"
              type="password"
              autoComplete="new-password"
              value={form.newPassword}
              onChange={update('newPassword')}
              error={errors.newPassword}
              hint="8자 이상, 영문과 숫자를 함께"
            />
            <TextField
              label="새 비밀번호 확인"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={update('confirm')}
              error={errors.confirm}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="hint mt-0">바꾸면 다른 기기에서는 로그아웃돼요.</p>
            <Button type="submit" variant="default" loading={changing} icon={!changing && <KeyRound size={14} />}>
              비밀번호 바꾸기
            </Button>
          </div>
        </form>
      </GroupBox>

      <GroupBox title="회원 탈퇴">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="hint mt-0 max-w-md">
            내가 쓴 일기·사진·댓글·할 일·편지가 모두 지워지고 되돌릴 수 없어요. 친구가 쓴 일기는 친구 공간에 남아요.
          </p>
          <Button variant="danger" onClick={() => setDeleteOpen(true)} icon={<UserX size={14} />}>
            회원 탈퇴...
          </Button>
        </div>
      </GroupBox>

      <Dialog
        open={deleteOpen}
        title="회원 탈퇴"
        icon={<PixelIcon name="warning" size={14} />}
        onClose={closeDelete}
        width={440}
        footer={
          <>
            <Button variant="danger" onClick={deleteAccount} loading={deleting}>
              탈퇴하기
            </Button>
            <Button onClick={closeDelete} disabled={deleting} autoFocus>
              취소
            </Button>
          </>
        }
      >
        <form onSubmit={deleteAccount} noValidate className="flex items-start gap-4">
          <PixelIcon name="warning" size={32} className="mt-1" />
          <div className="min-w-0 flex-1">
            <p>정말 DearDays를 떠날까요?</p>
            <ul className="hint mt-2 list-disc pl-4">
              <li>내가 쓴 일기, 사진, 댓글, 공감, 할 일, 편지가 모두 지워져요.</li>
              <li>혼자 쓰던 공간은 공간째 사라지고, 친구가 있는 공간은 친구에게 남아요.</li>
              <li>되돌릴 수 없어요.</li>
            </ul>
            <TextField
              className="mt-3"
              label="확인을 위해 비밀번호를 입력해 주세요"
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
                setDeleteError('');
              }}
              error={deleteError}
            />
          </div>
        </form>
      </Dialog>
    </>
  );
}
