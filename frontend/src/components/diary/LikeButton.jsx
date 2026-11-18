import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { diaryService } from '../../services/diaryService.js';
import { getErrorMessage } from '../../utils/errors.js';
import PixelIcon from '../ui/PixelIcon.jsx';

const EMPTY_HEART = { p: '#ffffff', P: '#e8dcdc', w: '#ffffff' };

/** 하트 공감: 누르는 즉시 화면에 반영하고, 실패하면 되돌린다. */
export default function LikeButton({ diaryId, liked, count, onChange }) {
  const toast = useToast();
  const [state, setState] = useState({ liked, count });
  const [busy, setBusy] = useState(false);
  const [popKey, setPopKey] = useState(0);

  useEffect(() => {
    setState({ liked, count });
  }, [liked, count]);

  const toggle = async () => {
    if (busy) return;
    const previous = state;
    const nextLiked = !previous.liked;
    setState({ liked: nextLiked, count: previous.count + (nextLiked ? 1 : -1) });
    if (nextLiked) setPopKey((k) => k + 1);
    setBusy(true);
    try {
      const result = nextLiked ? await diaryService.like(diaryId) : await diaryService.unlike(diaryId);
      setState({ liked: result.liked, count: result.likeCount });
      onChange?.(result);
    } catch (error) {
      setState(previous);
      toast.error(getErrorMessage(error, '공감을 반영하지 못했어요.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className="btn gap-2"
      aria-pressed={state.liked}
      onClick={toggle}
      title={state.liked ? '공감 취소' : '공감하기'}
    >
      <span key={popKey} className={popKey ? 'like-pop inline-flex' : 'inline-flex'}>
        <PixelIcon name="heart" size={22} palette={state.liked ? undefined : EMPTY_HEART} />
      </span>
      <span>{state.liked ? '공감했어요' : '공감하기'}</span>
      <span className="font-small text-[12px] text-muted" aria-label={`공감 ${state.count}개`}>
        {state.count}
      </span>
    </button>
  );
}
