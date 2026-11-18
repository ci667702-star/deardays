import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { RotateCcw, Search } from 'lucide-react';
import DiaryList from '../components/diary/DiaryList.jsx';
import RoomGate from '../components/room/RoomGate.jsx';
import Button from '../components/ui/Button.jsx';
import { EmptyState, ErrorMessage, Loading } from '../components/ui/Feedback.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import TextField from '../components/ui/TextField.jsx';
import Window from '../components/ui/Window.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useRooms } from '../context/RoomContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { diaryService } from '../services/diaryService.js';

const PAGE_SIZE = 20;
const EMPTY = { q: '', author: '', from: '', to: '' };

export default function SearchPage() {
  useDocumentTitle('찾기');
  return (
    <RoomGate>
      <SearchView />
    </RoomGate>
  );
}

/** 검색 결과: 조건이 바뀌면 처음부터, '더 보기'는 이어 붙인다 */
function useSearchResults(roomId, filters, enabled) {
  const [state, setState] = useState({ items: [], total: 0, hasMore: false, page: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const key = JSON.stringify(filters);

  const load = useCallback(
    async (page) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      try {
        const res = await diaryService.list({ roomId, ...filters, sort: 'latest', page, limit: PAGE_SIZE });
        if (id !== requestId.current) return;
        setState((prev) => ({
          items: page === 1 ? res.items : [...prev.items, ...res.items],
          total: res.total,
          hasMore: res.hasMore,
          page: res.page,
        }));
      } catch (err) {
        if (id === requestId.current) setError(err);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roomId, key],
  );

  useEffect(() => {
    if (enabled) load(1);
    else setState({ items: [], total: 0, hasMore: false, page: 0 });
  }, [enabled, load]);

  return { ...state, loading, error, loadMore: () => load(state.page + 1), reload: () => load(1) };
}

function SearchView() {
  const { user } = useAuth();
  const { currentRoom, others } = useRooms();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const applied = {
    q: params.get('q') ?? '',
    author: params.get('author') ?? '',
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
  };
  const searched = params.has('go');
  const [form, setForm] = useState(applied);
  const [formError, setFormError] = useState('');
  const inputRef = useRef(null);

  // 주소가 바뀌면(뒤로 가기 등) 입력칸도 맞춘다
  useEffect(() => {
    setForm(applied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // author: '' (모두) | 'me' | 사람 번호
  const authorId = applied.author === 'me' ? user.id : Number(applied.author) || undefined;
  const results = useSearchResults(
    currentRoom.id,
    { q: applied.q.trim(), authorId, from: applied.from, to: applied.to },
    searched,
  );

  const submit = (event) => {
    event.preventDefault();
    if (form.q.trim().length > 50) return setFormError('찾을 낱말은 50자 이하로 써 주세요.');
    if (form.from && form.to && form.from > form.to) return setFormError('시작 날짜가 끝 날짜보다 늦어요.');
    setFormError('');
    const next = { go: '1' };
    Object.entries(form).forEach(([key, value]) => {
      if (value.trim()) next[key] = value.trim();
    });
    setParams(next);
  };

  const reset = () => {
    setForm(EMPTY);
    setFormError('');
    setParams({});
    inputRef.current?.focus();
  };

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  return (
    <Window
      title={`찾기: 일기 - ${currentRoom.name}`}
      icon={<PixelIcon name="search" size={14} />}
      onClose={() => navigate(-1)}
      closeLabel="닫기"
      statusBar={
        <span className="flex-1">
          {searched ? (results.loading && results.page === 0 ? '찾는 중...' : `${results.total}개를 찾았어요`) : '조건을 넣고 [지금 찾기]를 누르세요'}
        </span>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4 md:flex-row">
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <TextField
            ref={inputRef}
            className="sm:col-span-2"
            label="찾을 낱말 (제목·내용)"
            value={form.q}
            maxLength={50}
            onChange={update('q')}
            placeholder="예: 카페, 생일, 비"
            autoFocus
            autoComplete="off"
          />
          <div>
            <label htmlFor="search-author" className="label">
              쓴 사람
            </label>
            <select id="search-author" className="field" value={form.author} onChange={update('author')}>
              <option value="">모두</option>
              <option value="me">나 ({user.nickname})</option>
              {others.map((friend) => (
                <option key={friend.id} value={String(friend.id)}>
                  {friend.nickname}
                </option>
              ))}
            </select>
          </div>
          {/* 날짜 칸은 브라우저가 정한 최소 폭보다 줄지 않으므로 좁은 화면에서는 위아래로 */}
          <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
            <TextField className="min-w-0" label="날짜 (부터)" type="date" value={form.from} onChange={update('from')} />
            <span className="hidden pb-2 sm:block" aria-hidden="true">
              ~
            </span>
            <TextField className="min-w-0" label="날짜 (까지)" type="date" value={form.to} onChange={update('to')} />
          </div>
          {formError && <p className="hint hint--error sm:col-span-2">{formError}</p>}
        </div>
        <div className="flex gap-2 md:w-[120px] md:flex-col">
          <Button type="submit" variant="default" icon={<Search size={14} />} className="flex-1 md:flex-none">
            지금 찾기
          </Button>
          <Button onClick={reset} icon={<RotateCcw size={14} />} className="flex-1 md:flex-none">
            새로 찾기
          </Button>
        </div>
      </form>

      <hr className="etched my-4" />

      {!searched && (
        <EmptyState
          icon="search"
          title="무엇을 찾을까요?"
          description="낱말, 쓴 사람, 날짜 중 원하는 것만 넣어도 돼요. 아무것도 넣지 않으면 모든 일기를 보여 줘요."
        />
      )}
      {searched && results.error && <ErrorMessage error={results.error} onRetry={results.reload} />}
      {searched && results.loading && results.items.length === 0 && <Loading label="일기를 찾는 중..." />}
      {searched && !results.loading && !results.error && results.items.length === 0 && (
        <EmptyState
          icon="search"
          title="찾는 일기가 없어요"
          description="낱말을 줄이거나 날짜 범위를 넓혀서 다시 찾아보세요."
        />
      )}
      {results.items.length > 0 && <DiaryList diaries={results.items} highlight={applied.q.trim()} />}
      {results.hasMore && (
        <div className="mt-3 flex justify-center">
          <Button onClick={results.loadMore} loading={results.loading}>
            더 보기 ({results.items.length}/{results.total})
          </Button>
        </div>
      )}
    </Window>
  );
}
