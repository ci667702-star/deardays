import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Save } from 'lucide-react';
import { DoodleField } from '../components/diary/Doodle.jsx';
import ImageUploader from '../components/diary/ImageUploader.jsx';
import { checkImageFiles } from '../components/diary/imageRules.js';
import { MoodWeatherPicker } from '../components/diary/MoodWeather.jsx';
import RoomGate from '../components/room/RoomGate.jsx';
import TopicBanner from '../components/topic/TopicBanner.jsx';
import Button, { ButtonLink } from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Dialog from '../components/ui/Dialog.jsx';
import { ErrorMessage, Loading } from '../components/ui/Feedback.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import TextField from '../components/ui/TextField.jsx';
import Window from '../components/ui/Window.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useRooms } from '../context/RoomContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges.js';
import { assetUrl } from '../services/api.js';
import { diaryService } from '../services/diaryService.js';
import { topicService } from '../services/topicService.js';
import { formatDateTime, isValidDateString, todayString } from '../utils/date.js';
import { drafts } from '../utils/drafts.js';
import { getErrorMessage, getErrorStatus } from '../utils/errors.js';

const TITLE_MAX = 100;
const CONTENT_MAX = 20000;

export default function DiaryEditorPage() {
  const { id } = useParams();
  const diaryId = id ? Number(id) : null;
  useDocumentTitle(diaryId ? '일기 수정' : '새 일기');

  // 새 일기는 공유 공간이 있어야 쓸 수 있다
  if (!diaryId) {
    return (
      <RoomGate>
        <DiaryEditor key="new" />
      </RoomGate>
    );
  }
  return <EditLoader key={diaryId} diaryId={diaryId} />;
}

function EditLoader({ diaryId }) {
  const { data: diary, loading, error, reload } = useFetch(() => diaryService.get(diaryId), [diaryId]);

  if (loading && !diary) {
    return (
      <Window title="일기 여는 중" icon={<PixelIcon name="hourglass" size={14} />}>
        <Loading label="일기를 불러오는 중..." />
      </Window>
    );
  }
  if (error) {
    return (
      <Window title="일기를 열 수 없음" icon={<PixelIcon name="warning" size={14} />}>
        <ErrorMessage error={error} onRetry={getErrorStatus(error) === 404 ? undefined : reload} />
        <ButtonLink to="/room">일기 목록으로</ButtonLink>
      </Window>
    );
  }
  if (!diary.isMine) {
    return (
      <Window title="수정할 수 없음" icon={<PixelIcon name="warning" size={14} />}>
        <ErrorMessage message="내가 쓴 일기만 수정할 수 있어요." />
        <ButtonLink to={`/diaries/${diary.id}`}>일기로 돌아가기</ButtonLink>
      </Window>
    );
  }
  return <DiaryEditor original={diary} />;
}

function DiaryEditor({ original }) {
  const isEdit = Boolean(original);
  const navigate = useNavigate();
  const toast = useToast();
  const { currentRoom } = useRooms();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const initial = useMemo(() => {
    if (original) {
      return {
        title: original.title,
        content: original.content,
        diaryDate: original.diaryDate,
        mood: original.mood ?? null,
        weather: original.weather ?? null,
      };
    }
    const fromQuery = searchParams.get('date');
    return {
      title: '',
      content: '',
      diaryDate: isValidDateString(fromQuery) ? fromQuery : todayString(),
      mood: null,
      weather: null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original]);

  // 임시 저장 위치: 새 일기는 공간별, 수정은 일기별
  const draftScope = isEdit ? `edit:${original.id}` : `new:${currentRoom.id}`;
  const [restorable, setRestorable] = useState(() => {
    const saved = drafts.load(user.id, draftScope);
    if (!saved) return null;
    const differs = ['title', 'content', 'diaryDate', 'mood', 'weather'].some((key) => (saved[key] ?? null) !== (initial[key] ?? null));
    return differs ? saved : null;
  });
  const [draftSavedAt, setDraftSavedAt] = useState(null);

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [existing, setExisting] = useState(original?.images ?? []);
  const [removedIds, setRemovedIds] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [imageError, setImageError] = useState('');
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(null);
  const [formError, setFormError] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const titleRef = useRef(null);

  // 오늘의 주제: 고칠 때는 원래 주제, 새로 쓸 때는 주소의 ?topic= 으로 받은 주제
  const initialTopicId = useMemo(() => {
    if (original) return original.topic?.id ?? null;
    const fromQuery = Number(searchParams.get('topic'));
    return Number.isInteger(fromQuery) && fromQuery > 0 ? fromQuery : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original]);
  const [topicId, setTopicId] = useState(initialTopicId);
  const [topic, setTopic] = useState(original?.topic ?? null);
  useEffect(() => {
    if (original || !initialTopicId) return undefined;
    let cancelled = false;
    topicService
      .get(initialTopicId)
      .then((found) => {
        if (!cancelled) setTopic(found);
      })
      .catch((error) => {
        if (cancelled) return;
        setTopicId(null);
        toast.error(getErrorMessage(error, '주제를 불러오지 못했어요. 주제 없이 써 주세요.'));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTopicId]);

  // 낙서: { src, blob } (blob 이 있으면 새로 그린 그림)
  const [doodle, setDoodle] = useState(() => (original?.doodleUrl ? { src: assetUrl(original.doodleUrl), blob: null } : null));
  const changeDoodle = (next) => {
    setDoodle((previous) => {
      if (previous?.blob) URL.revokeObjectURL(previous.src);
      return next;
    });
  };
  const doodleRef = useRef(doodle);
  doodleRef.current = doodle;
  useEffect(
    () => () => {
      if (doodleRef.current?.blob) URL.revokeObjectURL(doodleRef.current.src);
    },
    [],
  );
  const doodleChanged = Boolean(doodle?.blob) || (Boolean(original?.doodleUrl) && !doodle);

  const textChanged =
    form.title !== initial.title ||
    form.content !== initial.content ||
    form.diaryDate !== initial.diaryDate ||
    form.mood !== initial.mood ||
    form.weather !== initial.weather;
  const dirty = textChanged || removedIds.length > 0 || newItems.length > 0 || doodleChanged || topicId !== initialTopicId;
  useUnsavedChanges(dirty && !saving);

  // 쓰는 동안 0.8초마다 임시 저장 (사진은 저장되지 않음). 복원 여부를 묻는 동안에는 덮어쓰지 않는다.
  useEffect(() => {
    if (restorable || saving) return undefined;
    const timer = setTimeout(() => {
      if (textChanged) {
        drafts.save(user.id, draftScope, form);
        setDraftSavedAt(new Date());
      } else {
        drafts.remove(user.id, draftScope);
        setDraftSavedAt(null);
      }
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, textChanged, restorable, saving]);

  const restoreDraft = () => {
    const { title, content, diaryDate, mood, weather } = restorable;
    setForm({
      title: title ?? '',
      content: content ?? '',
      diaryDate: isValidDateString(diaryDate) ? diaryDate : initial.diaryDate,
      mood: mood ?? null,
      weather: weather ?? null,
    });
    setRestorable(null);
    toast.info('임시 저장한 내용을 불러왔어요.');
  };

  const discardDraft = () => {
    drafts.remove(user.id, draftScope);
    setRestorable(null);
  };

  // 미리보기용 object URL 정리
  const newItemsRef = useRef(newItems);
  newItemsRef.current = newItems;
  useEffect(() => () => newItemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview)), []);

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const addFiles = (files) => {
    const { accepted, problems } = checkImageFiles(files, existing.length + newItems.length);
    setImageError(problems.join('\n'));
    setNewItems((prev) => [
      ...prev,
      ...accepted.map((file) => ({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  };

  const removeNew = (key) => {
    setNewItems((prev) => {
      const target = prev.find((item) => item.key === key);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((item) => item.key !== key);
    });
    setImageError('');
  };

  const removeExisting = (imageId) => {
    setExisting((prev) => prev.filter((image) => image.id !== imageId));
    setRemovedIds((prev) => [...prev, imageId]);
    setImageError('');
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = '제목을 입력해 주세요.';
    else if (form.title.trim().length > TITLE_MAX) next.title = `제목은 ${TITLE_MAX}자 이하로 써 주세요.`;
    if (!isValidDateString(form.diaryDate)) next.diaryDate = '날짜를 골라 주세요.';
    if (!form.content.trim()) next.content = '내용을 입력해 주세요.';
    else if (form.content.length > CONTENT_MAX) next.content = `내용은 ${CONTENT_MAX.toLocaleString()}자 이하로 써 주세요.`;
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.title) titleRef.current?.focus();
      return;
    }

    setSaving(true);
    setFormError('');
    setProgress(newItems.length > 0 ? 0 : null);
    const payload = {
      title: form.title.trim(),
      content: form.content,
      diaryDate: form.diaryDate,
      mood: form.mood,
      weather: form.weather,
      topicId,
      newImages: newItems.map((item) => item.file),
      doodle: doodle?.blob ?? null,
      removeDoodle: isEdit && Boolean(original.doodleUrl) && !doodle,
    };
    const onUploadProgress = (e) => {
      if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
    };

    try {
      const saved = isEdit
        ? await diaryService.update(original.id, { ...payload, removeImageIds: removedIds }, { onUploadProgress })
        : await diaryService.create({ ...payload, roomId: currentRoom.id }, { onUploadProgress });
      drafts.remove(user.id, draftScope);
      toast.success(isEdit ? '일기를 고쳐 저장했어요.' : '일기를 저장했어요. 친구에게도 보여요!');
      navigate(`/diaries/${saved.id}`, { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, '일기를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.'));
      setSaving(false);
      setProgress(null);
    }
  };

  const leave = () => {
    const fallback = isEdit ? `/diaries/${original.id}` : '/room';
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(fallback);
  };

  const handleCancel = () => {
    if (dirty) setConfirmLeave(true);
    else leave();
  };

  const windowTitle = `${form.title.trim() || '제목 없음'} - ${isEdit ? '일기 수정' : '새 일기'}`;
  const roomName = isEdit ? null : currentRoom?.name;

  return (
    <>
      <Window
        title={windowTitle}
        icon={<PixelIcon name="letter" size={14} />}
        onClose={handleCancel}
        closeLabel="쓰기 취소"
        statusBar={
          <>
            <span className="flex-1">{roomName ? `'${roomName}'에 저장돼요` : '수정 중'}</span>
            {draftSavedAt && <span className="hidden sm:block">임시 저장됨 {clockFormat.format(draftSavedAt)}</span>}
            <span>{form.content.length.toLocaleString()}자</span>
            <span>사진 {existing.length + newItems.length}장</span>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {topicId && topic && <TopicBanner topic={topic} onRemove={() => setTopicId(null)} />}
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
            <TextField
              ref={titleRef}
              label="제목"
              value={form.title}
              maxLength={TITLE_MAX}
              onChange={update('title')}
              error={errors.title}
              placeholder={topicId ? '주제에 어울리는 제목을 붙여 볼까요?' : '오늘에 제목을 붙인다면?'}
              autoFocus={!isEdit}
            />
            <TextField label="날짜" type="date" value={form.diaryDate} onChange={update('diaryDate')} error={errors.diaryDate} max="2100-12-31" min="1900-01-01" />
          </div>

          <MoodWeatherPicker
            mood={form.mood}
            weather={form.weather}
            onChange={({ mood, weather }) => setForm((prev) => ({ ...prev, mood, weather }))}
          />

          <div>
            <label htmlFor="diary-content" className="label">
              내용
            </label>
            <div className="sunken p-[2px]">
              <textarea
                id="diary-content"
                className="paper min-h-[360px]"
                value={form.content}
                onChange={update('content')}
                maxLength={CONTENT_MAX}
                placeholder="오늘 있었던 일을 편하게 적어 보세요."
                aria-invalid={errors.content ? true : undefined}
                aria-describedby={errors.content ? 'diary-content-error' : undefined}
              />
            </div>
            {errors.content && (
              <p id="diary-content-error" className="hint hint--error">
                {errors.content}
              </p>
            )}
          </div>

          <ImageUploader
            existing={existing}
            newItems={newItems}
            onAddFiles={addFiles}
            onRemoveExisting={removeExisting}
            onRemoveNew={removeNew}
            error={imageError}
          />

          <DoodleField value={doodle} onChange={changeDoodle} />

          {formError && (
            <div role="alert" className="flex items-start gap-2 bg-pink-soft px-3 py-2 shadow-[var(--bevel-thin-in)]">
              <PixelIcon name="warning" size={18} className="mt-0.5" />
              <p className="text-[14px]">{formError}</p>
            </div>
          )}

          {progress !== null && (
            <div className="flex items-center gap-3" role="status">
              <span className="font-small shrink-0 text-[12px]">사진 올리는 중 {progress}%</span>
              <div className="progress flex-1" aria-hidden="true">
                <span className="!animate-none" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="submit" variant="default" loading={saving} icon={!saving && <Save size={14} />}>
              저장
            </Button>
            <Button onClick={handleCancel} disabled={saving}>
              취소
            </Button>
          </div>
        </form>
      </Window>

      <ConfirmDialog
        open={confirmLeave}
        title="쓰기 취소"
        message="작성 중인 내용을 저장하지 않고 나갈까요?"
        detail="지금까지 쓴 내용과 새로 고른 사진이 사라져요."
        confirmLabel="나가기"
        cancelLabel="계속 쓰기"
        danger
        onConfirm={() => {
          setConfirmLeave(false);
          drafts.remove(user.id, draftScope);
          leave();
        }}
        onCancel={() => setConfirmLeave(false)}
      />

      <Dialog
        open={Boolean(restorable)}
        title="임시 저장된 일기"
        icon={<PixelIcon name="letter" size={14} />}
        onClose={discardDraft}
        width={430}
        footer={
          <>
            <Button variant="default" onClick={restoreDraft} autoFocus>
              이어 쓰기
            </Button>
            <Button onClick={discardDraft}>새로 쓰기</Button>
          </>
        }
      >
        {restorable && (
          <div className="flex items-start gap-4">
            <PixelIcon name="bulb" size={32} className="mt-1" />
            <div className="min-w-0">
              <p>저장하지 않은 일기가 있어요. 이어서 쓸까요?</p>
              <p className="ink mt-2 truncate text-[15px]">{restorable.title?.trim() || '제목 없음'}</p>
              <p className="hint">
                {formatDateTime(restorable.savedAt)}에 임시 저장. 사진은 임시 저장되지 않아요.
              </p>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}

const clockFormat = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' });
