import { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { inquiryService } from '../../services/inquiryService.js';
import { formatDateTime } from '../../utils/date.js';
import { getErrorMessage } from '../../utils/errors.js';
import {
  INQUIRY_CATEGORIES,
  INQUIRY_MAX_LENGTH,
  INQUIRY_MIN_LENGTH,
  categoryLabel,
  inquiryStatusLabel,
} from '../../utils/inquiries.js';
import { cx } from '../../utils/cx.js';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { ErrorMessage, Loading } from '../ui/Feedback.jsx';
import GroupBox from '../ui/GroupBox.jsx';
import TextField from '../ui/TextField.jsx';

/** 문의 하나: 종류·상태·보낸 시각, 내용, 관리자 답변 */
function InquiryItem({ inquiry, onDelete }) {
  const status = inquiryStatusLabel(inquiry);
  return (
    <li className="flex flex-col gap-2 bg-hilite px-3 py-3 shadow-[var(--bevel-thin-in)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip">{categoryLabel(inquiry.category)}</span>
        <span className={cx('chip', inquiry.status === 'open' ? 'chip--soon' : 'chip--today')}>{status}</span>
        <span className="list-meta flex-1">{formatDateTime(inquiry.createdAt)}</span>
        <button type="button" className="btn-tool" onClick={() => onDelete(inquiry)} title="이 문의 지우기">
          <Trash2 size={13} aria-hidden="true" />
          <span className="sr-only">이 문의 지우기</span>
        </button>
      </div>
      <p className="ink whitespace-pre-wrap break-words text-[15px]">{inquiry.content}</p>
      {inquiry.answer && (
        <div className="bg-cream px-3 py-2 shadow-[var(--bevel-thin-in)]">
          <p className="text-[12px] text-muted">
            관리자 답변{inquiry.answeredAt ? ` · ${formatDateTime(inquiry.answeredAt)}` : ''}
          </p>
          <p className="ink mt-1 whitespace-pre-wrap break-words text-[15px]">{inquiry.answer}</p>
        </div>
      )}
    </li>
  );
}

/** 내 정보의 '문의하기': 관리자에게 오류나 바라는 점을 보내고, 답변을 여기서 본다 */
export default function InquirySection() {
  const toast = useToast();
  const list = useFetch(() => inquiryService.listMine(), []);
  const [category, setCategory] = useState('bug');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const text = content.trim();
    if (text.length < INQUIRY_MIN_LENGTH) return setError(`문의 내용을 ${INQUIRY_MIN_LENGTH}자 이상 써 주세요.`);
    setSending(true);
    setError('');
    try {
      const created = await inquiryService.create({ category, content: text });
      list.setData((items) => [created, ...(items ?? [])]);
      setContent('');
      toast.success('문의를 보냈어요. 답변이 오면 여기에 보여요.');
    } catch (err) {
      setError(getErrorMessage(err, '문의를 보내지 못했어요.'));
    } finally {
      setSending(false);
    }
  };

  const remove = async () => {
    setDeleteBusy(true);
    try {
      await inquiryService.remove(deleting.id);
      list.setData((items) => (items ?? []).filter((item) => item.id !== deleting.id));
      setDeleting(null);
      toast.success('문의를 지웠어요.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  };

  const items = list.data ?? [];

  return (
    <GroupBox title="문의하기">
      <p className="mb-3 text-[14px]">
        오류가 있거나 바라는 기능이 있으면 관리자에게 알려 주세요. 답변은 여기에서 볼 수 있어요.
      </p>
      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <div>
          <label htmlFor="inquiry-category" className="label">
            종류
          </label>
          <select
            id="inquiry-category"
            className="field w-auto min-w-[160px]"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {INQUIRY_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <TextField
          as="textarea"
          label="내용"
          rows={4}
          value={content}
          maxLength={INQUIRY_MAX_LENGTH}
          inputClassName="ink resize-y text-[15px]"
          placeholder={'어떤 화면에서 무엇을 했을 때 어떻게 됐는지 적어 주면 빨리 고칠 수 있어요.'}
          onChange={(event) => {
            setContent(event.target.value);
            if (error) setError('');
          }}
          error={error}
          hint={`${content.length}/${INQUIRY_MAX_LENGTH}`}
        />
        <div className="flex justify-end">
          <Button type="submit" variant="default" loading={sending} icon={!sending && <Send size={14} />}>
            문의 보내기
          </Button>
        </div>
      </form>

      <hr className="etched my-4" />
      <p className="mb-2 text-[13px] text-muted">내가 보낸 문의 {list.data ? `${items.length}개` : ''}</p>
      {list.loading && !list.data && <Loading compact label="문의를 불러오는 중..." />}
      {list.error && <ErrorMessage error={list.error} onRetry={list.reload} />}
      {list.data && items.length === 0 && <p className="text-[13px] text-muted">아직 보낸 문의가 없어요.</p>}
      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((inquiry) => (
            <InquiryItem key={inquiry.id} inquiry={inquiry} onDelete={setDeleting} />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="문의 지우기"
        message="이 문의를 지울까요?"
        detail="관리자 문의함에서도 사라져요."
        confirmLabel="지우기"
        danger
        loading={deleteBusy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </GroupBox>
  );
}
