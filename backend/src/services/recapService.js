import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/HttpError.js';
import { fromDbDate, localTodayString, toDbDate } from '../utils/date.js';
import { toPublicUser } from '../utils/serializers.js';
import { topWords } from '../utils/words.js';
import { assertRoomMember } from './roomService.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/** 값별 개수를 많은 순서로: [{ value, count }] (null 은 세지 않음) */
function countBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const value = key(item);
    if (value === null || value === undefined) continue;
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count }));
}

/** 하루라도 일기가 있었던 날이 가장 길게 이어진 구간 */
function longestStreak(dateStrings) {
  const days = [...new Set(dateStrings)].sort();
  let best = null;
  let start = null;
  let prev = null;
  let length = 0;
  for (const day of days) {
    const time = toDbDate(day).getTime();
    if (prev !== null && time - prev === DAY_MS) {
      length += 1;
    } else {
      start = day;
      length = 1;
    }
    if (!best || length > best.days) best = { days: length, from: start, to: day };
    prev = time;
  }
  return best;
}

const diarySummary = (diary, extra = {}) => ({
  id: diary.id,
  title: diary.title,
  diaryDate: fromDbDate(diary.diaryDate),
  author: toPublicUser(diary.author),
  ...extra,
});

/** 연말 결산에서 고를 수 있는 해: 공간에 첫 일기를 쓴 해부터 올해까지 (최근 해가 먼저) */
async function availableYears(roomId, currentYear) {
  const { _min: min } = await prisma.diary.aggregate({
    where: { diaryRoomId: roomId },
    _min: { diaryDate: true },
  });
  const first = min.diaryDate ? Math.min(Math.max(min.diaryDate.getUTCFullYear(), currentYear - 30), currentYear) : currentYear;
  const years = [];
  for (let year = currentYear; year >= first; year -= 1) years.push(year);
  return years;
}

/**
 * 연말 결산 "우리의 한 해": 공간의 그해 일기·댓글·공감·도장 등을 모아 센다.
 * 올해는 오늘까지의 기록으로 계산한다 (12월 31일이 지나면 확정).
 */
export async function getRecap(userId, roomId, { year }) {
  await assertRoomMember(roomId, userId);
  const today = localTodayString();
  const currentYear = Number(today.slice(0, 4));
  if (year > currentYear) throw HttpError.badRequest('아직 오지 않은 해예요.', 'FUTURE_YEAR');

  // 일기 날짜(DATE)는 UTC 자정, 작성 시각은 서버 시간대(Asia/Seoul) 기준으로 해의 경계를 잡는다
  const dateRange = { gte: toDbDate(`${year}-01-01`), lt: toDbDate(`${year + 1}-01-01`) };
  const timeRange = { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) };

  const [room, diaries, years] = await Promise.all([
    prisma.diaryRoom.findUnique({
      where: { id: roomId },
      include: { members: { include: { user: true }, orderBy: { joinedAt: 'asc' } } },
    }),
    prisma.diary.findMany({
      where: { diaryRoomId: roomId, diaryDate: dateRange },
      select: {
        id: true,
        title: true,
        content: true,
        diaryDate: true,
        authorId: true,
        mood: true,
        weather: true,
        topicId: true,
        doodleUrl: true,
        createdAt: true,
        author: true,
        _count: { select: { images: true, comments: true, likes: true, stamps: true } },
      },
      orderBy: [{ diaryDate: 'asc' }, { createdAt: 'asc' }],
    }),
    availableYears(roomId, currentYear),
  ]);

  const inRoom = { diary: { diaryRoomId: roomId }, createdAt: timeRange };
  const [comments, likes, stamps, letters, todosDone] = await Promise.all([
    prisma.comment.groupBy({ by: ['userId'], where: inRoom, _count: { _all: true } }),
    prisma.like.groupBy({ by: ['userId'], where: inRoom, _count: { _all: true } }),
    prisma.stamp.groupBy({ by: ['userId', 'kind'], where: inRoom, _count: { _all: true } }),
    prisma.letter.count({ where: { diaryRoomId: roomId, createdAt: timeRange } }),
    prisma.todo.count({ where: { diaryRoomId: roomId, isDone: true, doneAt: timeRange } }),
  ]);
  const sum = (rows) => rows.reduce((total, row) => total + row._count._all, 0);
  const forUser = (rows, id) => sum(rows.filter((row) => row.userId === id));

  // 사람별: 지금 멤버 + 그해 일기를 쓴 사람 (나간 사람 포함)
  const people = new Map(room.members.map((member) => [member.user.id, member.user]));
  for (const diary of diaries) if (!people.has(diary.authorId)) people.set(diary.authorId, diary.author);

  // 새벽(0시~4시)에 쓴 일기
  const lateNight = (diary) => diary.createdAt.getHours() < 5;
  const members = [...people.values()].map((user) => {
    const mine = diaries.filter((diary) => diary.authorId === user.id);
    return {
      user: toPublicUser(user),
      isMe: user.id === userId,
      diaries: mine.length,
      characters: mine.reduce((total, diary) => total + diary.content.length, 0),
      photos: mine.reduce((total, diary) => total + diary._count.images, 0),
      commentsWritten: forUser(comments, user.id),
      likesGiven: forUser(likes, user.id),
      stampsGiven: forUser(stamps, user.id),
      lateNightDiaries: mine.filter(lateNight).length,
      topMood: countBy(mine, (diary) => diary.mood)[0]?.value ?? null,
    };
  });

  const monthly = Array.from({ length: 12 }, () => 0);
  const weekdays = Array.from({ length: 7 }, () => 0);
  const authorsByDay = new Map();
  for (const diary of diaries) {
    monthly[diary.diaryDate.getUTCMonth()] += 1;
    weekdays[diary.diaryDate.getUTCDay()] += 1;
    const day = fromDbDate(diary.diaryDate);
    if (!authorsByDay.has(day)) authorsByDay.set(day, new Set());
    authorsByDay.get(day).add(diary.authorId);
  }
  const busiestMonthIndex = monthly.indexOf(Math.max(...monthly));
  const busiestWeekdayIndex = weekdays.indexOf(Math.max(...weekdays));

  const byLength = [...diaries].sort((a, b) => b.content.length - a.content.length || a.id - b.id);
  const loveScore = (diary) => diary._count.likes + diary._count.comments + diary._count.stamps;
  const byLove = [...diaries].sort((a, b) => loveScore(b) - loveScore(a) || a.id - b.id);
  const yearOver = today > `${year}-12-31`;

  return {
    year,
    room: { id: room.id, name: room.name },
    years,
    isComplete: yearOver,
    // 올해라면 오늘까지, 지난해라면 12월 31일까지 센 것
    countedUntil: yearOver ? `${year}-12-31` : today,
    totals: {
      diaries: diaries.length,
      characters: diaries.reduce((total, diary) => total + diary.content.length, 0),
      photos: diaries.reduce((total, diary) => total + diary._count.images, 0),
      doodles: diaries.filter((diary) => diary.doodleUrl).length,
      topicDiaries: diaries.filter((diary) => diary.topicId).length,
      comments: sum(comments),
      likes: sum(likes),
      stamps: sum(stamps),
      letters,
      todosDone,
      daysWritten: authorsByDay.size,
      bothWroteDays: [...authorsByDay.values()].filter((authors) => authors.size >= 2).length,
      lateNightDiaries: diaries.filter(lateNight).length,
    },
    members,
    moods: countBy(diaries, (diary) => diary.mood).map(({ value, count }) => ({ mood: value, count })),
    weathers: countBy(diaries, (diary) => diary.weather).map(({ value, count }) => ({ weather: value, count })),
    stampKinds: countBy(
      stamps.flatMap((row) => Array.from({ length: row._count._all }, () => row.kind)),
      (kind) => kind,
    ).map(({ value, count }) => ({ kind: value, count })),
    monthly,
    weekdays,
    busiestMonth: diaries.length ? { month: busiestMonthIndex + 1, count: monthly[busiestMonthIndex] } : null,
    busiestWeekday: diaries.length ? { weekday: busiestWeekdayIndex, count: weekdays[busiestWeekdayIndex] } : null,
    longestStreak: longestStreak(diaries.map((diary) => fromDbDate(diary.diaryDate))),
    firstDiary: diaries[0] ? diarySummary(diaries[0]) : null,
    longestDiary: byLength[0] ? diarySummary(byLength[0], { length: byLength[0].content.length }) : null,
    mostLoved:
      byLove[0] && loveScore(byLove[0]) > 0
        ? diarySummary(byLove[0], {
            likes: byLove[0]._count.likes,
            comments: byLove[0]._count.comments,
            stamps: byLove[0]._count.stamps,
          })
        : null,
    topWords: topWords(
      diaries.map((diary) => `${diary.title} ${diary.content}`),
      12,
    ),
  };
}
