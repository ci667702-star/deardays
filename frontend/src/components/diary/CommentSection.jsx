import { useEffect, useRef, useState } from 'react';
import { CornerDownRight, Pencil, Send, Trash2, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { commentService } from '../../services/commentService.js';
import { formatDateTime, formatRelative, wasEdited } from '../../utils/date.js';
import { getErrorMessage } from '../../utils/errors.js';
import { COMMENT_FACES, faceOf } from '../../utils/moods.js';
import { cx } from '../../utils/cx.js';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { ErrorMessage, Loading } from '../ui/Feedback.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';

const MAX_LENGTH = 500;
const EMPTY_MESSAGE = '내용을 입력하거나 얼굴을 골라 주세요.';

/**
 * 얼굴 이모티콘 고르기: 버튼을 누르면 얼굴 8개가 펼쳐진다. 고른 얼굴을 다시 누르거나 ×로 뺀다.
 * 얼굴만 달고 글은 비워도 된다.
 */
function FacePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const current = faceOf(value);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!boxRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={boxRef} className="relative flex items-center gap-0.5">
      <button
        type="button"
        className="btn-tool min-h-[30px] px-1.5 text-[12px]"
        aria-expanded={open}
        aria-haspopup="true"
        title="얼굴 이모티콘 달기"
        onClick={() => setOpen((v) => !v)}
      >
        <PixelIcon name={current?.icon ?? 'moodHappy'} size={18} className={current ? undefined : 'opacity-60'} />
        {current ? current.label : '얼굴'}
      </button>
      {current && (
        <button type="button" className="btn-tool min-h-[30px] px-1" onClick={() => onChange(null)} title="얼굴 빼기" aria-label="얼굴 빼기">
          <X size={12} aria-hidden="true" />
        </button>
      )}
      {open && (
        <div
          role="group"
          aria-label="얼굴 이모티콘 고르기"
          className="win absolute bottom-full left-0 z-20 mb-1 grid w-max grid-cols-4 gap-1 !p-1.5"
        >
          {COMMENT_FACES.map((face) => (
            <button
              key={face.id}
              type="button"
              className="btn-tool flex-col !gap-0.5 px-2 py-1 text-[11px]"
              aria-pressed={face.id === value}
              onClick={() => {
                onChange(face.id === value ? null : face.id);
                setOpen(false);
              }}
            >
              <PixelIcon name={face.icon} size={27} />
              {face.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** 댓글 수정·답글 쓰기에 같이 쓰는 작은 입력칸 */
function CommentEditor({ id, label, initial = '', initialFace = null, placeholder, saveLabel = '저장', onSave, onCancel }) {
  const [value, setValue] = useState(initial);
  const [face, setFace] = useState(initialFace);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    const trimmed = value.trim();
    if (!trimmed && !face) return setError(EMPTY_MESSAGE);
    setSaving(true);
    setError('');
    try {
      await onSave({ content: trimmed, face });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div className="mt-2">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className="field ink min-h-[64px] resize-y text-[15px]"
        value={value}
        maxLength={MAX_LENGTH}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) save();
          if (e.key === 'Escape') onCancel();
        }}
        onFocus={(e) => {
          // 답글의 답글: '@이름 ' 뒤에서 바로 이어 쓰게
          const end = e.target.value.length;
          e.target.setSelectionRange(end, end);
        }}
        aria-invalid={error ? true : undefined}
        autoFocus
      />
      {error && <p className="hint hint--error">{error}</p>}
      <div className="mt-2 flex items-center gap-2">
        <FacePicker
          value={face}
          onChange={(next) => {
            setFace(next);
            if (error) setError('');
          }}
        />
        <span className="flex-1" />
        <Button size="sm" variant="default" onClick={save} loading={saving}>
          {saveLabel}
        </Button>
        <Button size="sm" onClick={onCancel} disabled={saving}>
          취소
        </Button>
      </div>
    </div>
  );
}

/** 댓글 한 개 (원댓글 또는 답글). 지운 댓글이 답글 때문에 남아 있으면 자리만 보여 준다. */
function CommentItem({ comment, isReply, editing, onReply, onEdit, onDelete, onSaveEdit, onCancelEdit }) {
  if (comment.isDeleted) {
    return (
      <div className="flex gap-3">
        <span className={cx('grid shrink-0 place-items-center border border-dashed border-shade text-shade', isReply ? 'size-6' : 'size-8')} aria-hidden="true">
          ×
        </span>
        <p className="font-small flex-1 self-center text-[12px] text-muted">삭제된 댓글이에요.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Avatar user={comment.author} size={isReply ? 24 : 32} />
      <div className="min-w-0 flex-1 bg-paper px-3 py-2 shadow-[var(--bevel-thin-in)]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="text-[14px]">
            {comment.author.nickname}
            <time className="font-small ml-2 text-[12px] text-muted" dateTime={comment.createdAt} title={formatDateTime(comment.createdAt)}>
              {formatRelative(comment.createdAt)}
              {wasEdited(comment.createdAt, comment.updatedAt) && ' (수정됨)'}
            </time>
          </p>
          {!editing && (
            <span className="flex gap-1">
              <button type="button" className="btn-tool min-h-0 py-0.5 text-[12px]" onClick={onReply}>
                <CornerDownRight size={11} /> 답글
              </button>
              {comment.isMine && (
                <>
                  <button type="button" className="btn-tool min-h-0 py-0.5 text-[12px]" onClick={onEdit}>
                    <Pencil size={11} /> 수정
                  </button>
                  <button type="button" className="btn-tool min-h-0 py-0.5 text-[12px] text-danger" onClick={onDelete}>
                    <Trash2 size={11} /> 삭제
                  </button>
                </>
              )}
            </span>
          )}
        </div>
        {editing ? (
          <CommentEditor
            id={`comment-edit-${comment.id}`}
            label="댓글 수정"
            initial={comment.content}
            initialFace={comment.face}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        ) : (
          <>
            {faceOf(comment.face) && (
              <PixelIcon name={faceOf(comment.face).icon} size={45} title={faceOf(comment.face).label} className="mt-1.5 block" />
            )}
            {comment.content && <p className="ink mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{comment.content}</p>}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * 댓글 목록 + 작성 폼.
 * - 댓글마다 '답글'로 그 아래에 답글을 단다 (한 단계: 답글에 답하면 같은 댓글 아래 '@이름'으로)
 * - 수정·삭제는 내가 쓴 댓글에만 보인다
 */
export default function CommentSection({ diaryId, onCountChange }) {
  const toast = useToast();
  const { data: comments, loading, error, reload, setData } = useFetch(() => commentService.list(diaryId), [diaryId]);
  const [draft, setDraft] = useState('');
  const [draftFace, setDraftFace] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  // 답글 쓰는 중: { rootId, targetId, mention }
  const [replyTo, setReplyTo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const roots = (comments ?? []).filter((comment) => !comment.parentId);
  const repliesOf = (rootId) => (comments ?? []).filter((comment) => comment.parentId === rootId);
  const liveCount = (comments ?? []).filter((comment) => !comment.isDeleted).length;

  const submit = async (event) => {
    event?.preventDefault();
    const content = draft.trim();
    if (!content && !draftFace) return setFormError(EMPTY_MESSAGE);
    setSubmitting(true);
    setFormError('');
    try {
      const comment = await commentService.create(diaryId, { content, face: draftFace });
      setData((list) => [...(list ?? []), comment]);
      setDraft('');
      setDraftFace(null);
      onCountChange?.(1);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const startReply = (comment) => {
    setEditingId(null);
    const rootId = comment.parentId ?? comment.id;
    setReplyTo({ rootId, targetId: comment.id, mention: comment.parentId ? comment.author.nickname : null });
  };

  const sendReply = async ({ content, face }) => {
    const reply = await commentService.create(diaryId, { content, face, parentId: replyTo.targetId });
    setData((list) => [...(list ?? []), reply]);
    setReplyTo(null);
    onCountChange?.(1);
  };

  const saveEdit = async (commentId, changes) => {
    const updated = await commentService.update(commentId, changes);
    setData((list) => list.map((c) => (c.id === commentId ? updated : c)));
    setEditingId(null);
    toast.success('댓글을 수정했어요.');
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await commentService.remove(deleteTarget.id);
      // 답글이 달린 댓글은 자리만 남을 수 있어서 목록을 다시 받는다
      reload();
      onCountChange?.(-1);
      toast.success('댓글을 삭제했어요.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const itemProps = (comment, isReply) => ({
    comment,
    isReply,
    editing: editingId === comment.id,
    onReply: () => startReply(comment),
    onEdit: () => {
      setReplyTo(null);
      setEditingId(comment.id);
    },
    onDelete: () => setDeleteTarget(comment),
    onSaveEdit: (changes) => saveEdit(comment.id, changes),
    onCancelEdit: () => setEditingId(null),
  });

  return (
    <section aria-labelledby="comments-title">
      <h3 id="comments-title" className="mb-3">
        댓글 {comments ? liveCount : ''}
      </h3>

      {loading && !comments && <Loading compact label="댓글을 불러오는 중..." />}
      {error && <ErrorMessage error={error} onRetry={reload} />}

      {comments && roots.length === 0 && <p className="font-small mb-4 text-[12px] text-muted">아직 댓글이 없어요. 첫 마디를 남겨 보세요.</p>}

      {roots.length > 0 && (
        <ul className="mb-4 flex flex-col gap-3">
          {roots.map((root) => {
            const replies = repliesOf(root.id);
            const replying = replyTo?.rootId === root.id;
            return (
              <li key={root.id}>
                <CommentItem {...itemProps(root, false)} />
                {(replies.length > 0 || replying) && (
                  // 옛 윈도우 탐색기 나무 보기처럼 점선으로 이어 붙인다
                  <ul className="ml-4 mt-2 flex flex-col gap-2 border-l border-dotted border-shade pl-4" aria-label={`${root.author?.nickname ?? '지운 댓글'}에 단 답글`}>
                    {replies.map((reply) => (
                      <li key={reply.id}>
                        <CommentItem {...itemProps(reply, true)} />
                      </li>
                    ))}
                    {replying && (
                      <li className="pl-9">
                        <p className="font-small flex items-center gap-1 text-[12px] text-muted">
                          <CornerDownRight size={12} aria-hidden="true" />
                          {(replyTo.mention ?? root.author?.nickname) ? `${replyTo.mention ?? root.author.nickname}님에게 답글` : '답글'}
                        </p>
                        <CommentEditor
                          key={replyTo.targetId}
                          id={`reply-${root.id}`}
                          label="답글 쓰기"
                          initial={replyTo.mention ? `@${replyTo.mention} ` : ''}
                          placeholder="답글을 남겨 주세요"
                          saveLabel="답글 등록"
                          onSave={sendReply}
                          onCancel={() => setReplyTo(null)}
                        />
                      </li>
                    )}
                  </ul>
                )}
              </li>
            );
          })}
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
        <div className="mt-2 flex items-center gap-2">
          <FacePicker
            value={draftFace}
            onChange={(next) => {
              setDraftFace(next);
              if (formError) setFormError('');
            }}
          />
          <p id="new-comment-hint" className={cx('min-w-0 flex-1', formError ? 'hint hint--error mt-0' : 'hint mt-0')}>
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
        detail={
          deleteTarget && !deleteTarget.parentId && repliesOf(deleteTarget.id).length > 0
            ? '답글은 남고, 이 댓글 자리에는 "삭제된 댓글이에요"가 보여요. 되돌릴 수 없어요.'
            : '삭제한 댓글은 되돌릴 수 없어요.'
        }
        confirmLabel="삭제"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
