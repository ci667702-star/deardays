import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import RoomGate from '../components/room/RoomGate.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import { ErrorMessage, Loading } from '../components/ui/Feedback.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import Window from '../components/ui/Window.jsx';
import { useRooms } from '../context/RoomContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { roomService } from '../services/roomService.js';
import { WEEKDAYS, formatDiaryDate, todayString } from '../utils/date.js';
import { MOODS, moodOf } from '../utils/moods.js';
import { stampOf } from '../utils/stamps.js';

const STEPS = [
  { id: 'welcome', title: '시작' },
  { id: 'numbers', title: '숫자로 본 한 해' },
  { id: 'people', title: '누가 더 많이 썼을까' },
  { id: 'rhythm', title: '우리가 쓴 리듬' },
  { id: 'mood', title: '한 해의 기분' },
  { id: 'words', title: '자주 쓴 낱말' },
  { id: 'memories', title: '기억에 남는 일기' },
  { id: 'finish', title: '마침' },
];

// 막대: 강조 하나는 진한 핑크, 나머지는 그림자 색 (테마를 따라 바뀜)
const ACCENT = 'var(--color-pink-deep)';
const QUIET = 'var(--color-shade)';

const fmt = (n) => Number(n ?? 0).toLocaleString('ko-KR');

/** 1월 중순까지는 지난해 결산을 먼저 보여 준다 */
function defaultYear() {
  const today = todayString();
  const year = Number(today.slice(0, 4));
  return today.slice(5) <= '01-15' ? year - 1 : year;
}

export default function RecapPage() {
  useDocumentTitle('연말 결산');
  return (
    <RoomGate>
      <Recap />
    </RoomGate>
  );
}

function Recap() {
  const { currentRoom } = useRooms();
  const [year, setYear] = useState(defaultYear);
  const [step, setStep] = useState(0);
  const recap = useFetch(() => roomService.recap(currentRoom.id, year), [currentRoom.id, year]);
  const headingRef = useRef(null);
  const navigate = useNavigate();

  // 단계를 옮기면 제목으로 포커스를 옮겨 화면 읽기 프로그램이 새 내용을 읽게 한다
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const data = recap.data;
  const empty = data && data.totals.diaries === 0;
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-5xl">
      <Window
        title={`우리의 ${year} - 결산 마법사`}
        icon={<PixelIcon name="trophy" size={14} />}
        onClose={() => navigate('/')}
        closeLabel="마법사 닫기"
        maximizable={false}
        bodyClassName="p-0"
      >
        <div className="grid min-h-[440px] md:grid-cols-[190px_minmax(0,1fr)]">
          <aside className="wizard-side flex items-center gap-3 px-4 py-3 md:flex-col md:items-start md:justify-between md:py-5">
            <PixelIcon name="trophy" size={56} className="shrink-0" />
            <div>
              <p className="text-[34px] leading-none md:text-[44px]">{year}</p>
              <p className="font-small mt-1 text-[12px] opacity-90">{currentRoom.name}</p>
            </div>
            <ol className="font-small ml-auto hidden text-[12px] md:ml-0 md:block" aria-label="단계">
              {STEPS.map((item, index) => (
                <li key={item.id} className={index === step ? 'font-bold' : 'opacity-70'} aria-current={index === step ? 'step' : undefined}>
                  {index === step ? '▶ ' : '　'}
                  {item.title}
                </li>
              ))}
            </ol>
            <p className="font-small ml-auto text-[12px] md:hidden">
              {step + 1} / {STEPS.length}
            </p>
          </aside>

          <div className="flex min-w-0 flex-col bg-face">
            <div className="min-w-0 flex-1 p-4 sm:p-5">
              <h1 ref={headingRef} tabIndex={-1} className="mb-3 text-[18px] font-bold outline-none">
                {current.title}
              </h1>
              {recap.loading && !data && <Loading label="한 해를 모으는 중..." />}
              {recap.error && <ErrorMessage error={recap.error} onRetry={recap.reload} />}
              {data && (
                <StepBody
                  id={current.id}
                  data={data}
                  year={year}
                  empty={empty}
                  onYear={(next) => {
                    setYear(next);
                    setStep(0);
                  }}
                />
              )}
            </div>
            <div className="border-t border-shade px-4 py-3 shadow-[inset_0_1px_var(--color-hilite)]">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                  &lt; 뒤로
                </Button>
                {last ? (
                  <Button variant="default" onClick={() => setStep(0)}>
                    처음부터 다시
                  </Button>
                ) : (
                  <Button variant="default" onClick={() => setStep((s) => s + 1)} disabled={!data || empty}>
                    다음 &gt;
                  </Button>
                )}
                <Button onClick={() => navigate('/')}>{last ? '닫기' : '취소'}</Button>
              </div>
            </div>
          </div>
        </div>
      </Window>
    </div>
  );
}

function StepBody({ id, data, year, empty, onYear }) {
  switch (id) {
    case 'welcome':
      return <Welcome data={data} year={year} empty={empty} onYear={onYear} />;
    case 'numbers':
      return <Numbers data={data} />;
    case 'people':
      return <People data={data} />;
    case 'rhythm':
      return <Rhythm data={data} />;
    case 'mood':
      return <Mood data={data} />;
    case 'words':
      return <Words data={data} />;
    case 'memories':
      return <Memories data={data} />;
    default:
      return <Finish data={data} year={year} />;
  }
}

function Welcome({ data, year, empty, onYear }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] leading-relaxed">
        <b>{data.room.name}</b>의 {year}년을 정리해 주는 마법사예요.
        <br />
        일기, 사진, 댓글, 도장까지 한 해 동안 둘이 남긴 흔적을 한 장씩 넘겨 보세요.
      </p>
      <label className="flex flex-wrap items-center gap-2 text-[14px]">
        <span>어느 해를 볼까요?</span>
        <select className="field w-[120px]" value={year} onChange={(e) => onYear(Number(e.target.value))}>
          {data.years.map((value) => (
            <option key={value} value={value}>
              {value}년
            </option>
          ))}
        </select>
      </label>
      {!data.isComplete && (
        <p className="font-small bg-cream px-3 py-2 text-[12px] shadow-[var(--bevel-thin-in)]">
          아직 {year}년이 끝나지 않아서 {formatDiaryDate(data.countedUntil, { withYear: false })}까지의 기록으로 셌어요. 12월 31일까지 계속 바뀌어요.
        </p>
      )}
      {empty ? (
        <p className="flex items-center gap-2 text-[14px]">
          <PixelIcon name="warning" size={24} /> {year}년에는 아직 쓴 일기가 없어요. 다른 해를 골라 보세요.
        </p>
      ) : (
        <p className="text-[14px]">
          준비됐으면 <b>다음</b>을 눌러 주세요.
        </p>
      )}
    </div>
  );
}

function Tile({ label, value, unit, note, text }) {
  return (
    <div className="bg-hilite px-3 py-2.5 shadow-[var(--bevel-in)]">
      <p className="font-small text-[12px] text-muted">{label}</p>
      <p className="mt-0.5 text-[26px] font-bold leading-tight">
        {text ?? (value === null || value === undefined ? '-' : fmt(value))}
        {!text && value !== null && value !== undefined && <span className="ml-0.5 text-[14px] font-normal">{unit}</span>}
      </p>
      {note && <p className="font-small mt-0.5 text-[11px] text-muted">{note}</p>}
    </div>
  );
}

function Numbers({ data }) {
  const t = data.totals;
  const topStamp = data.stampKinds[0] ? stampOf(data.stampKinds[0].kind) : null;
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Tile label="쓴 일기" value={t.diaries} unit="편" note={`일기를 쓴 날 ${fmt(t.daysWritten)}일`} />
        <Tile label="쓴 글자" value={t.characters} unit="자" />
        <Tile label="둘 다 쓴 날" value={t.bothWroteDays} unit="일" />
        <Tile label="올린 사진" value={t.photos} unit="장" />
        <Tile label="그린 낙서" value={t.doodles} unit="장" />
        <Tile label="주제로 쓴 글" value={t.topicDiaries} unit="편" />
        <Tile label="댓글" value={t.comments} unit="개" />
        <Tile label="공감" value={t.likes} unit="번" />
        <Tile label="도장" value={t.stamps} unit="개" note={topStamp ? `제일 많이 찍은 도장: ${topStamp.label}` : undefined} />
        <Tile label="타임캡슐 편지" value={t.letters} unit="통" />
        <Tile label="함께 끝낸 할 일" value={t.todosDone} unit="개" />
        <Tile label="새벽(0~5시)에 쓴 일기" value={t.lateNightDiaries} unit="편" />
      </div>
    </div>
  );
}

/** 이름 + 막대 + 숫자 한 줄. 막대는 모두 같은 기준선에서 시작한다 */
function MeterRow({ label, value, max, unit, accent, icon }) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 2 : 0) : 0;
  return (
    <li className="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)_auto] items-center gap-2 py-1">
      <span className="flex min-w-0 items-center gap-1.5 text-[13px]">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <span className="relative h-[14px]" aria-hidden="true">
        <span
          className="absolute inset-y-0 left-0 rounded-r-[4px]"
          style={{ width: `${width}%`, background: accent ? ACCENT : QUIET }}
        />
      </span>
      <span className="text-right text-[13px] tabular-nums">
        {fmt(value)}
        {unit}
      </span>
    </li>
  );
}

const PEOPLE_METRICS = [
  { key: 'diaries', label: '쓴 일기', unit: '편' },
  { key: 'characters', label: '쓴 글자', unit: '자' },
  { key: 'photos', label: '올린 사진', unit: '장' },
  { key: 'commentsWritten', label: '단 댓글', unit: '개' },
  { key: 'likesGiven', label: '누른 공감', unit: '번' },
  { key: 'stampsGiven', label: '찍은 도장', unit: '개' },
];

function People({ data }) {
  const members = data.members;
  const writer = [...members].sort((a, b) => b.characters - a.characters)[0];
  const owl = [...members].sort((a, b) => b.lateNightDiaries - a.lateNightDiaries)[0];
  return (
    <div className="flex flex-col gap-4">
      {members.length > 1 && writer && (
        <p className="text-[14px]">
          올해의 <b>글쟁이</b>는 {writer.user.nickname}님! 글자 {fmt(writer.characters)}자를 썼어요.
          {owl?.lateNightDiaries > 0 && (
            <>
              {' '}
              <b>올빼미</b>는 새벽에 {fmt(owl.lateNightDiaries)}편을 쓴 {owl.user.nickname}님.
            </>
          )}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {PEOPLE_METRICS.map((metric) => {
          const max = Math.max(...members.map((m) => m[metric.key]));
          return (
            <section key={metric.key} className="bg-hilite px-3 py-2 shadow-[var(--bevel-in)]">
              <h2 className="font-small text-[12px] text-muted">{metric.label}</h2>
              <ul>
                {members.map((member) => (
                  <MeterRow
                    key={member.user.id}
                    label={member.isMe ? `${member.user.nickname} (나)` : member.user.nickname}
                    icon={<Avatar user={member.user} size={18} />}
                    value={member[metric.key]}
                    max={max}
                    unit={metric.unit}
                    accent={members.length > 1 && member[metric.key] === max && max > 0}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** 월별 일기 수: 가장 많이 쓴 달만 강조, 값은 그 달에만 적고 나머지는 마우스·포커스로 */
function MonthlyColumns({ monthly, busiest }) {
  const max = Math.max(...monthly, 1);
  return (
    <figure>
      <figcaption className="font-small mb-2 text-[12px] text-muted">달마다 쓴 일기 (편)</figcaption>
      <div className="bg-hilite px-2 pb-1 pt-6 shadow-[var(--bevel-in)]">
        <div className="flex h-[130px] items-end gap-[2px] border-b border-shade">
          {monthly.map((count, index) => {
            const isBusiest = busiest && index + 1 === busiest.month;
            return (
              <div
                key={index}
                tabIndex={0}
                aria-label={`${index + 1}월 ${count}편`}
                className="group relative flex h-full flex-1 flex-col items-center justify-end outline-none"
              >
                <span className="pointer-events-none absolute -top-5 z-10 hidden whitespace-nowrap bg-cream px-1 text-[11px] shadow-[var(--bevel-thin-out)] group-hover:block group-focus-visible:block">
                  {index + 1}월 · {count}편
                </span>
                {isBusiest && count > 0 && <span className="mb-0.5 text-[11px] font-bold group-hover:invisible group-focus-visible:invisible">{count}</span>}
                <span
                  className="w-[min(24px,70%)] rounded-t-[4px] group-hover:opacity-80 group-focus-visible:outline group-focus-visible:outline-1 group-focus-visible:outline-dark"
                  style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? 2 : 0, background: isBusiest ? ACCENT : QUIET }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-[2px] pt-1" aria-hidden="true">
          {monthly.map((_, index) => (
            <span key={index} className="font-small flex-1 text-center text-[11px] text-muted">
              {index + 1}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}

function Rhythm({ data }) {
  const streak = data.longestStreak;
  return (
    <div className="flex flex-col gap-4">
      <MonthlyColumns monthly={data.monthly} busiest={data.busiestMonth} />
      <div className="grid gap-2 sm:grid-cols-3">
        <Tile
          label="가장 많이 쓴 달"
          value={data.busiestMonth?.month}
          unit="월"
          note={data.busiestMonth ? `${fmt(data.busiestMonth.count)}편` : undefined}
        />
        <Tile
          label="가장 많이 쓴 요일"
          text={data.busiestWeekday ? `${WEEKDAYS[data.busiestWeekday.weekday]}요일` : '-'}
          note={data.busiestWeekday ? `${fmt(data.busiestWeekday.count)}편` : undefined}
        />
        <Tile
          label="가장 길게 이어 쓴 날"
          value={streak?.days}
          unit="일 연속"
          note={streak ? `${formatDiaryDate(streak.from, { withYear: false, withWeekday: false })} ~ ${formatDiaryDate(streak.to, { withYear: false, withWeekday: false })}` : undefined}
        />
      </div>
    </div>
  );
}

function Mood({ data }) {
  const counts = new Map(data.moods.map((item) => [item.mood, item.count]));
  const rows = MOODS.map((mood) => ({ ...mood, count: counts.get(mood.id) ?? 0 })).sort((a, b) => b.count - a.count);
  const max = Math.max(...rows.map((row) => row.count), 0);
  const top = rows[0]?.count > 0 ? rows[0] : null;
  const noMood = data.totals.diaries - rows.reduce((sum, row) => sum + row.count, 0);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px]">
        {top ? (
          <>
            우리의 {data.year}년은 <b>{top.label}</b>이 가장 많았어요.
          </>
        ) : (
          '올해는 기분을 고른 일기가 없어요.'
        )}
      </p>
      <section className="bg-hilite px-3 py-2 shadow-[var(--bevel-in)]">
        <h2 className="font-small text-[12px] text-muted">기분을 고른 일기 (편)</h2>
        <ul>
          {rows.map((row) => (
            <MeterRow
              key={row.id}
              label={row.label}
              icon={<PixelIcon name={row.icon} size={18} />}
              value={row.count}
              max={max}
              unit="편"
              accent={top && row.id === top.id}
            />
          ))}
        </ul>
        {noMood > 0 && <p className="font-small mt-1 text-[11px] text-muted">기분을 고르지 않은 일기 {fmt(noMood)}편은 빼고 셌어요.</p>}
      </section>
      {data.members.length > 1 && (
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
          {data.members.map((member) => {
            const mood = moodOf(member.topMood);
            return (
              <li key={member.user.id} className="flex items-center gap-1.5">
                <Avatar user={member.user} size={20} />
                {member.user.nickname}님은
                {mood ? (
                  <>
                    <PixelIcon name={mood.icon} size={18} /> <b>{mood.label}</b>
                  </>
                ) : (
                  ' 기분을 잘 안 골랐어요'
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Words({ data }) {
  if (data.topWords.length === 0) {
    return <p className="text-[14px]">셀 만한 낱말이 아직 없어요. 일기를 조금 더 써 보세요!</p>;
  }
  const max = data.topWords[0].count;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[14px]">가장 많은 일기에 나온 낱말이에요. (띄어쓰기로 대충 셌어요)</p>
      <ol className="flex flex-wrap items-baseline gap-2">
        {data.topWords.map((item, index) => (
          <li
            key={item.word}
            className="ink bg-paper px-2 py-1 shadow-[var(--bevel-thin-out)]"
            style={{ fontSize: `${14 + Math.round((item.count / max) * 14)}px` }}
          >
            {index === 0 && <span className="sr-only">1위 </span>}
            {item.word}
            <span className="font-small ml-1 text-[11px] text-muted">{fmt(item.count)}편</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function DiaryCard({ label, diary, detail }) {
  if (!diary) return null;
  return (
    <li className="bg-hilite px-3 py-2.5 shadow-[var(--bevel-in)]">
      <p className="font-small text-[12px] text-muted">{label}</p>
      <Link to={`/diaries/${diary.id}`} className="ink mt-0.5 block text-[18px] leading-snug">
        {diary.title}
      </Link>
      <p className="font-small mt-1 flex flex-wrap items-center gap-x-2 text-[12px] text-muted">
        <Avatar user={diary.author} size={16} />
        {diary.author.nickname} · {formatDiaryDate(diary.diaryDate, { withYear: false })}
        {detail && <span>· {detail}</span>}
      </p>
    </li>
  );
}

function Memories({ data }) {
  const loved = data.mostLoved;
  return (
    <ul className="flex flex-col gap-2">
      <DiaryCard label="올해 첫 일기" diary={data.firstDiary} />
      <DiaryCard label="가장 긴 일기" diary={data.longestDiary} detail={data.longestDiary ? `${fmt(data.longestDiary.length)}자` : null} />
      <DiaryCard
        label="가장 사랑받은 일기"
        diary={loved}
        detail={loved ? `공감 ${fmt(loved.likes)} · 댓글 ${fmt(loved.comments)} · 도장 ${fmt(loved.stamps)}` : null}
      />
      {!loved && <li className="font-small px-1 text-[12px] text-muted">공감·댓글·도장을 받은 일기가 아직 없어요.</li>}
    </ul>
  );
}

/** 옛 설치 프로그램처럼 진행 막대가 찬 다음 끝났다고 알려 준다 */
function Finish({ data, year }) {
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [progress, setProgress] = useState(reduce ? 100 : 0);
  useEffect(() => {
    if (progress >= 100) return undefined;
    const timer = setTimeout(() => setProgress((p) => Math.min(100, p + 9)), 140);
    return () => clearTimeout(timer);
  }, [progress]);
  const done = progress >= 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3" role="status">
        <span className="font-small shrink-0 text-[12px]">{done ? '설치 완료' : '추억을 설치하는 중...'}</span>
        <div className="progress progress--static flex-1" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="font-small w-10 text-right text-[12px] tabular-nums">{progress}%</span>
      </div>
      {done && (
        <div className="flex items-start gap-3">
          <PixelIcon name="heart" size={40} />
          <div>
            <p className="text-[16px] font-bold">{year}년의 추억 {fmt(data.totals.diaries)}편을 마음속에 설치했어요.</p>
            <p className="mt-1 text-[14px]">{year + 1}년에도 {data.room.name}에서 함께 써요!</p>
            <p className="font-small mt-2 text-[12px] text-muted">창을 닫으려면 [닫기]를 눌러 주세요.</p>
          </div>
        </div>
      )}
    </div>
  );
}
