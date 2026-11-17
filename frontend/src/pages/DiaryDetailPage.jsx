import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import CommentSection from '../components/diary/CommentSection.jsx';
import LikeButton from '../components/diary/LikeButton.jsx';
import { MoodWeatherBadge } from '../components/diary/MoodWeather.jsx';
import PhotoGallery from '../components/diary/PhotoGallery.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { ButtonLink } from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { ErrorMessage, Loading } from '../components/ui/Feedback.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import Window from '../components/ui/Window.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { diaryService } from '../services/diaryService.js';
import { formatDateTime, formatDiaryDate, wasEdited } from '../utils/date.js';
import { getErrorMessage, getErrorStatus } from '../utils/errors.js';

export default function DiaryDetailPage() {
  const { id } = useParams();
  return <DiaryDetail key={id} diaryId={Number(id)} />;
}

function DiaryDetail({ diaryId }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: diary, loading, error, reload, setData } = useFetch(() => diaryService.get(diaryId), [diaryId]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  useDocumentTitle(diary?.title ?? '일기');

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/room');
  };

  if (loading && !diary) {
    return (
      <Window title="일기 여는 중" icon={<PixelIcon name="hourglass" size={14} />}>
        <Loading label="일기를 펼치는 중..." />
      </Window>
    );
  }

  if (error && !diary) {
    const notFound = getErrorStatus(error) === 404;
    return (
      <Window title={notFound ? '일기를 찾을 수 없음' : '일기를 열 수 없음'} icon={<PixelIcon name="warning" size={14} />}>
        <ErrorMessage
          message={notFound ? '삭제되었거나, 내가 참여하지 않은 공간의 일기예요.' : getErrorMessage(error)}
          onRetry={notFound ? undefined : reload}
        />
        <ButtonLink to="/room">일기 목록으로</ButtonLink>
      </Window>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await diaryService.remove(diary.id);
      toast.success('일기를 삭제했어요.');
      navigate('/room', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
    }
  };

  const edited = wasEdited(diary.createdAt, diary.updatedAt);

  return (
    <article className="mx-auto max-w-3xl">
      <Window
        title={`${diary.title}.txt`}
        icon={<PixelIcon name="letter" size={14} />}
        onClose={goBack}
        closeLabel="닫기"
        toolbar={
          <>
            <button type="button" className="btn-tool" onClick={goBack}>
              <ArrowLeft size={14} /> 뒤로
            </button>
            {diary.isMine && (
              <>
                <Link to={`/diaries/${diary.id}/edit`} className="btn-tool">
                  <Pencil size={14} /> 수정
                </Link>
                <button type="button" className="btn-tool text-danger" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={14} /> 삭제
                </button>
              </>
            )}
          </>
        }
        statusBar={
          <>
            <span className="flex-1" title={formatDateTime(diary.createdAt)}>
              작성 {formatDateTime(diary.createdAt)}
            </span>
            {edited && <span className="hidden sm:block">수정 {formatDateTime(diary.updatedAt)}</span>}
            <span>사진 {diary.images.length}장</span>
          </>
        }
      >
        <header className="flex items-center gap-3">
          <Avatar user={diary.author} size={44} />
          <div className="min-w-0">
            <p className="truncate">
              {diary.author.nickname}
              {diary.isMine && <span className="font-small ml-1 text-[12px] text-muted">(나)</span>}
            </p>
            <p className="font-small text-[12px] text-muted">{formatDiaryDate(diary.diaryDate)}의 일기</p>
          </div>
        </header>

        <h1 className="ink mt-4 text-[24px] leading-snug">{diary.title}</h1>
        <MoodWeatherBadge mood={diary.mood} weather={diary.weather} className="mt-2" />

        <div className="sunken mt-3 p-[2px]">
          <div className="paper min-h-[200px]">{diary.content}</div>
        </div>

        {diary.images.length > 0 && (
          <div className="mt-4">
            <PhotoGallery images={diary.images} title={diary.title} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <LikeButton
            diaryId={diary.id}
            liked={diary.likedByMe}
            count={diary.likeCount}
            onChange={(result) => setData((d) => ({ ...d, likedByMe: result.liked, likeCount: result.likeCount }))}
          />
          <span className="font-small text-[12px] text-muted">
            {diary.isMine ? '친구의 공감과 댓글을 기다려 봐요.' : `${diary.author.nickname}님에게 마음을 전해 보세요.`}
          </span>
        </div>

        <hr className="etched my-5" />

        <CommentSection
          diaryId={diary.id}
          onCountChange={(delta) => setData((d) => ({ ...d, commentCount: d.commentCount + delta }))}
        />
      </Window>

      <ConfirmDialog
        open={confirmDelete}
        title="일기 삭제"
        message={`'${diary.title}' 일기를 삭제할까요?`}
        detail="사진과 댓글, 공감도 함께 지워지고 되돌릴 수 없어요."
        confirmLabel="삭제"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </article>
  );
}
