import { useState } from 'react';
import { Pencil, Send, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { commentService } from '../../services/commentService.js';
import { formatDateTime, formatRelative, wasEdited } from '../../utils/date.js';
import { getErrorMessage } from '../../utils/errors.js';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { ErrorMessage, Loading } from '../ui/Feedback.jsx';

const MAX_LENGTH = 500;

function CommentEditor({ initial, onSave, onCancel }) {
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    const trimmed = value.trim();
    if (!trimmed) return setError('댓글 내용을 입력해 주세요.');
    setSaving(true);
    setError('');
    try {
      await onSave(trimmed);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div className="mt-2">
      <label className="sr-only" htmlFor="comment-edit">
        댓글 수정
      </label>
      <textarea
        id="comment-edit"
        className="field ink min-h-[72px] resize-y text-[15px]"
        value={value}
        maxLength={MAX_LENGTH}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) save();
          if (e.key === 'Escape') onCancel();
        }}
        aria-invalid={error ? true : undefined}
        autoFocus
      />
      {error && <p className="hint hint--error">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <Button size="sm" variant="default" onClick={save} loading={saving}>
          저장
        </Button>
        <Button size="sm" onClick={onCancel} disabled={saving}>
          취소
        </Button>
      </div>
    </div>
  );
}

/** 댓글 목록 + 작성 폼. 수정·삭제는 내가 쓴 댓글에만 보인다. */
export default function CommentSection({ diaryId, onCountChange }) {
  const toast = useToast();
  const { data: comments, loading, error, reload, setData } = useFetch(() => commentService.list(diaryId), [diaryId]);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const submit = async (event) => {
    event?.preventDefault();
    const content = draft.trim();
    if (!content) return setFormError('댓글 내용을 입력해 주세요.');
    setSubmitting(true);
    setFormError('');
    try {
      const comment = await commentService.create(diaryId, content);
      setData((list) => [...(list ?? []), comment]);
      setDraft('');
      onCountChange?.(1);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const saveEdit = async (commentId, content) => {
    const updated = await commentService.update(commentId, content);
    setData((list) => list.map((c) => (c.id === commentId ? updated : c)));
    setEditingId(null);
    toast.success('댓글을 수정했어요.');
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await commentService.remove(deleteTarget.id);
      setData((list) => list.filter((c) => c.id !== deleteTarget.id));
      onCountChange?.(-1);
      toast.success('댓글을 삭제했어요.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section aria-labelledby="comments-title">
      <h3 id="comments-title" className="mb-3">
        댓글 {comments ? comments.length : ''}
      </h3>

      {loading && !comments && <Loading compact label="댓글을 불러오는 중..." />}
      {error && <ErrorMessage error={error} onRetry={reload} />}

      {comments && comments.length === 0 && (
        <p className="font-small mb-4 text-[12px] text-muted">아직 댓글이 없어요. 첫 마디를 남겨 보세요.</p>
      )}

      {comments && comments.length > 0 && (
        <ul className="mb-4 flex flex-col gap-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <Avatar user={comment.author} size={32} />
              <div className="min-w-0 flex-1 bg-paper px-3 py-2 shadow-[var(--bevel-thin-in)]">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="text-[14px]">
                    {comment.author.nickname}
                    <time
                      className="font-small ml-2 text-[12px] text-muted"
                      dateTime={comment.createdAt}
                      title={formatDateTime(comment.createdAt)}
                    >
                      {formatRelative(comment.createdAt)}
                      {wasEdited(comment.createdAt, comment.updatedAt) && ' (수정됨)'}
                    </time>
                  </p>
                  {comment.isMine && editingId !== comment.id && (
                    <span className="flex gap-1">
                      <button type="button" className="btn-tool min-h-0 py-0.5 text-[12px]" onClick={() => setEditingId(comment.id)}>
                        <Pencil size={11} /> 수정
                      </button>
                      <button
                        type="button"
                        className="btn-tool min-h-0 py-0.5 text-[12px] text-danger"
                        onClick={() => setDeleteTarget(comment)}
                      >
                        <Trash2 size={11} /> 삭제
                      </button>
                    </span>
                  )}
                </div>
                {editingId === comment.id ? (
                  <CommentEditor
                    initial={comment.content}
                    onSave={(content) => saveEdit(comment.id, content)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <p className="ink mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{comment.content}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} noValidate>
        <label htmlFor="new-comment" className="sr-only">
          댓글 쓰기
        </label>
        <textarea
          id="new-comment"
          className="field ink min-h-[80px] resize-y text-[15px]"
          placeholder="따뜻한 한마디를 남겨 주세요"
          value={draft}
          maxLength={MAX_LENGTH}
          onChange={(e) => {
            setDraft(e.target.value);
            if (formError) setFormError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit();
          }}
          aria-invalid={formError ? true : undefined}
          aria-describedby="new-comment-hint"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <p id="new-comment-hint" className={formError ? 'hint hint--error mt-0' : 'hint mt-0'}>
            {formError || `${draft.length}/${MAX_LENGTH}자, Ctrl+Enter로 등록`}
          </p>
          <Button type="submit" variant="default" size="sm" loading={submitting} icon={<Send size={12} />}>
            등록
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="댓글 삭제"
        message="이 댓글을 삭제할까요?"
        detail="삭제한 댓글은 되돌릴 수 없어요."
        confirmLabel="삭제"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
