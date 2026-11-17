import { useState } from 'react';
import { Lock } from 'lucide-react';
import { addDays, formatDiaryDate, isValidDateString, todayString } from '../../utils/date.js';
import { getErrorMessage } from '../../utils/errors.js';
import Button from '../ui/Button.jsx';
import TextField from '../ui/TextField.jsx';

const TITLE_MAX = 60;
const CONTENT_MAX = 5000;

const PRESETS = [
  { label: '내일', days: 1 },
  { label: '1주 뒤', days: 7 },
  { label: '한 달 뒤', days: 30 },
  { label: '100일 뒤', days: 100 },
  { label: '1년 뒤', days: 365 },
];

/** 타임캡슐 편지 쓰기: 받는 사람(친구/나), 여는 날, 제목, 내용 */
export default function LetterComposer({ me, partner, onSend }) {
  const today = todayString();
  const [form, setForm] = useState({
    recipientId: String(partner?.id ?? me.id),
    openAt: addDays(today, 30),
    title: '',
    content: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = '제목을 입력해 주세요.';
    if (!form.content.trim()) next.content = '편지 내용을 입력해 주세요.';
    if (!isValidDateString(form.openAt)) next.openAt = '여는 날을 골라 주세요.';
    else if (form.openAt < today) next.openAt = '여는 날은 오늘이나 그 뒤로 골라 주세요.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    setFormError('');
    try {
      await onSend({
        recipientId: Number(form.recipientId),
        openAt: form.openAt,
        title: form.title.trim(),
        content: form.content,
      });
      setForm((prev) => ({ ...prev, title: '', content: '' }));
    } catch (err) {
      setFormError(getErrorMessage(err, '편지를 보내지 못했어요.'));
    } finally {
      setSending(false);
    }
  };

  const toSelf = Number(form.recipientId) === me.id;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="letter-to" className="label">
            받는 사람
          </label>
          <select id="letter-to" className="field" value={form.recipientId} onChange={update('recipientId')}>
            {partner && <option value={partner.id}>{partner.nickname}</option>}
            <option value={me.id}>미래의 나에게</option>
          </select>
        </div>
        <TextField
          label="여는 날"
          type="date"
          value={form.openAt}
          min={today}
          onChange={update('openAt')}
          error={errors.openAt}
          hint={isValidDateString(form.openAt) ? `${formatDiaryDate(form.openAt)}에 열려요` : undefined}
        />
      </div>
      <div role="group" aria-label="여는 날 빠르게 고르기" className="-mt-2 flex flex-wrap gap-1">
        {PRESETS.map((preset) => {
          const value = addDays(today, preset.days);
          return (
            <button
              key={preset.label}
              type="button"
              className="btn-tool min-h-0 py-1 text-[12px]"
              aria-pressed={form.openAt === value}
              onClick={() => setForm((prev) => ({ ...prev, openAt: value }))}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <TextField
        label="제목"
        value={form.title}
        maxLength={TITLE_MAX}
        onChange={update('title')}
        error={errors.title}
        placeholder={toSelf ? '예: 1년 뒤의 나에게' : '예: 생일 축하해!'}
        inputClassName="ink text-[16px]"
      />

      <div>
        <label htmlFor="letter-content" className="label">
          내용
        </label>
        <div className="sunken p-[2px]">
          <textarea
            id="letter-content"
            className="paper min-h-[260px]"
            value={form.content}
            maxLength={CONTENT_MAX}
            onChange={update('content')}
            placeholder={toSelf ? '지금의 나를 기억할 수 있게 적어 보세요.' : '여는 날의 친구에게 하고 싶은 말을 적어 보세요.'}
            aria-invalid={errors.content ? true : undefined}
          />
        </div>
        <p className={errors.content ? 'hint hint--error' : 'hint'}>
          {errors.content || `${form.content.length.toLocaleString()}/${CONTENT_MAX.toLocaleString()}자. 봉인하면 여는 날 전에는 ${toSelf ? '나도' : '친구도'} 내용을 볼 수 없어요.`}
        </p>
      </div>

      {formError && <p className="hint hint--error">{formError}</p>}

      <div className="flex justify-end">
        <Button type="submit" variant="default" loading={sending} icon={!sending && <Lock size={14} />}>
          편지 봉인하기
        </Button>
      </div>
    </form>
  );
}
