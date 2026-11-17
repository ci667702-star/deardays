import { useState } from 'react';
import { useLocation } from 'react-router';
import { LogIn } from 'lucide-react';
import Button, { ButtonLink } from '../components/ui/Button.jsx';
import Checkbox from '../components/ui/Checkbox.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import TextField from '../components/ui/TextField.jsx';
import Window from '../components/ui/Window.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getErrorMessage } from '../utils/errors.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  useDocumentTitle('로그인');
  const { login } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email ?? '', password: '', remember: true });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = '이메일을 입력해 주세요.';
    else if (!EMAIL_PATTERN.test(form.email.trim())) nextErrors.email = '이메일 형식이 올바르지 않아요.';
    if (!form.password) nextErrors.password = '비밀번호를 입력해 주세요.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setFormError('');
    try {
      const me = await login({ email: form.email.trim(), password: form.password, remember: form.remember });
      toast.success(`${me.nickname}님, 다시 만나서 반가워요!`);
      // 로그인되면 PublicOnlyRoute 가 원래 가려던 화면으로 보낸다
    } catch (error) {
      setFormError(getErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <Window title="DearDays에 로그인" icon={<PixelIcon name="letter" size={14} />} collapsible={false} maximizable={false}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:flex-row sm:gap-5">
        <PixelIcon name="heart" size={44} className="hidden sm:block" />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="font-small text-[12px] text-muted">이메일과 비밀번호를 입력해 일기장을 열어 주세요.</p>
          <TextField
            label="이메일"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            autoFocus
          />
          <TextField
            label="비밀번호"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
          />
          <Checkbox label="로그인 상태 유지" checked={form.remember} onChange={update('remember')} />
          {formError && (
            <div role="alert" className="flex items-start gap-2 bg-pink-soft px-3 py-2 shadow-[var(--bevel-thin-in)]">
              <PixelIcon name="warning" size={18} className="mt-0.5" />
              <p className="text-[14px]">{formError}</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 sm:w-[110px] sm:flex-col">
          <Button type="submit" variant="default" loading={loading} icon={!loading && <LogIn size={14} />} className="flex-1 sm:flex-none">
            로그인
          </Button>
          <ButtonLink to="/register" className="flex-1 sm:flex-none">
            회원가입
          </ButtonLink>
        </div>
      </form>
    </Window>
  );
}
