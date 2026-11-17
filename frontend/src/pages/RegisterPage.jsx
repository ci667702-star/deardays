import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import Button, { ButtonLink } from '../components/ui/Button.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import TextField from '../components/ui/TextField.jsx';
import Window from '../components/ui/Window.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { authService } from '../services/authService.js';
import { getErrorMessage } from '../utils/errors.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errors = {};
  const email = form.email.trim();
  if (!email) errors.email = '이메일을 입력해 주세요.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = '이메일 형식이 올바르지 않아요.';

  const nickname = form.nickname.trim();
  if (!nickname) errors.nickname = '닉네임을 입력해 주세요.';
  else if (nickname.length < 2 || nickname.length > 20) errors.nickname = '닉네임은 2~20자로 정해 주세요.';

  if (!form.password) errors.password = '비밀번호를 입력해 주세요.';
  else if (form.password.length < 8) errors.password = '비밀번호는 8자 이상이어야 해요.';
  else if (form.password.length > 64) errors.password = '비밀번호는 64자 이하로 정해 주세요.';
  else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
    errors.password = '비밀번호에 영문과 숫자를 모두 넣어 주세요.';

  if (!form.passwordConfirm) errors.passwordConfirm = '비밀번호를 한 번 더 입력해 주세요.';
  else if (form.password !== form.passwordConfirm) errors.passwordConfirm = '비밀번호가 서로 달라요.';
  return errors;
}

export default function RegisterPage() {
  useDocumentTitle('회원가입');
  const { register } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', nickname: '', password: '', passwordConfirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  // 이메일 중복 확인: idle | checking | available | taken
  const [emailCheck, setEmailCheck] = useState({ email: '', status: 'idle' });

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (key === 'email') setEmailCheck({ email: '', status: 'idle' });
  };

  const checkEmail = async () => {
    const email = form.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email) || emailCheck.email === email) return;
    setEmailCheck({ email, status: 'checking' });
    try {
      const available = await authService.checkEmail(email);
      setEmailCheck({ email, status: available ? 'available' : 'taken' });
    } catch {
      // 확인에 실패해도 가입 단계에서 서버가 다시 검사하므로 조용히 넘긴다
      setEmailCheck({ email: '', status: 'idle' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    if (!nextErrors.email && emailCheck.status === 'taken' && emailCheck.email === form.email.trim().toLowerCase()) {
      nextErrors.email = '이미 가입된 이메일이에요.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setFormError('');
    try {
      const me = await register({ email: form.email.trim(), nickname: form.nickname.trim(), password: form.password });
      toast.success(`${me.nickname}님, 환영해요! 친구와 함께 쓸 공간을 만들어 볼까요?`);
    } catch (error) {
      if (error.response?.data?.code === 'EMAIL_TAKEN') {
        setErrors((prev) => ({ ...prev, email: error.response.data.message }));
      } else {
        setFormError(getErrorMessage(error));
      }
      setLoading(false);
    }
  };

  const emailHint =
    emailCheck.status === 'checking'
      ? '사용할 수 있는지 확인하는 중...'
      : emailCheck.status === 'available'
        ? '사용할 수 있는 이메일이에요.'
        : undefined;
  const emailError = errors.email || (emailCheck.status === 'taken' ? '이미 가입된 이메일이에요. 로그인해 주세요.' : undefined);

  return (
    <Window title="새 계정 만들기" icon={<PixelIcon name="computer" size={14} />} collapsible={false} maximizable={false}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <TextField
          label="이메일"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          onChange={update('email')}
          onBlur={checkEmail}
          error={emailError}
          hint={emailHint}
          hintTone={emailCheck.status === 'available' ? 'ok' : undefined}
          autoFocus
        />
        <TextField
          label="닉네임"
          autoComplete="nickname"
          maxLength={20}
          value={form.nickname}
          onChange={update('nickname')}
          error={errors.nickname}
          hint="친구에게 보이는 이름이에요. (2~20자)"
        />
        <TextField
          label="비밀번호"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          hint="8자 이상, 영문과 숫자를 함께 넣어 주세요."
        />
        <TextField
          label="비밀번호 확인"
          type="password"
          autoComplete="new-password"
          value={form.passwordConfirm}
          onChange={update('passwordConfirm')}
          error={errors.passwordConfirm}
        />
        {formError && (
          <div role="alert" className="flex items-start gap-2 bg-pink-soft px-3 py-2 shadow-[var(--bevel-thin-in)]">
            <PixelIcon name="warning" size={18} className="mt-0.5" />
            <p className="text-[14px]">{formError}</p>
          </div>
        )}
        <hr className="etched my-1" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-small text-[12px] text-muted">이미 계정이 있나요?</p>
          <div className="flex gap-2">
            <ButtonLink to="/login">로그인</ButtonLink>
            <Button type="submit" variant="default" loading={loading} icon={!loading && <UserPlus size={14} />}>
              가입하기
            </Button>
          </div>
        </div>
      </form>
    </Window>
  );
}
