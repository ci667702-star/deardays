// 연말 결산의 '자주 쓴 낱말'을 고르는 간단한 낱말 세기.
// 형태소 분석기 없이 띄어쓰기로 나누고, 흔한 조사를 떼고, 동사·형용사처럼 끝나는 말과 너무 흔한 말은 뺀다.
// 정확한 분석이 아니라 '대충 이런 말을 많이 썼구나'를 보여 주는 용도.

// 길이가 긴 조사부터 확인한다 (예: '에서는'을 '는'보다 먼저).
// '이'로 시작하는 조사(이랑, 이나…)와 '이' 하나는 넣지 않는다: 고양이·떡볶이처럼 '이'로 끝나는 낱말이 많아서.
const PARTICLES = [
  '에서부터', '으로부터', '에게서는',
  '이에요', '입니다', '에서는', '에게는', '한테는', '으로는', '하고는', '까지는', '부터는', '에서도', '에게도', '한테도',
  '예요', '에서', '에게', '한테', '께서', '으로', '하고', '까지', '부터', '처럼', '보다', '마다', '라고',
  '은', '는', '을', '를', '가', '에', '의', '도', '만', '랑', '로', '와', '과', '야',
];
// 한 글자 조사는 세 글자 이상인 말에서만 뗀다 (나는, 바다 같은 두 글자 말은 그대로)
const MIN_LENGTH_FOR_ONE_CHAR = 3;
// 두 글자인데 이렇게 끝나면 '가고', '먹고' 같은 동사로 보고 뺀다
const SHORT_VERB_ENDINGS = new Set(['고', '서', '며', '면', '요', '죠', '네']);

// 이렇게 끝나면 동사·형용사·연결어로 보고 뺀다
const VERB_ENDINGS = [
  '었다', '았다', '했다', '였다', '한다', '는다', '겠다', '싶다', '었어', '았어', '했어', '였어', '어요', '아요', '해요', '세요',
  '는데', '은데', '니까', '어서', '아서', '해서', '면서', '지만', '네요', '구나', '거든', '더니', '려고', '도록', '었고', '았고',
  '했고', '하고', '하는', '하던', '했던', '있는', '없는', '같은', '같아', '같다', '좋은', '좋아', '좋다', '싶어', '싶은',
];

const STOPWORDS = new Set([
  '오늘', '어제', '내일', '그리고', '그래서', '그런데', '근데', '하지만', '그래도', '그러나', '그럼', '그러면', '그냥', '너무',
  '진짜', '정말', '많이', '조금', '약간', '아주', '엄청', '되게', '완전', '계속', '다시', '이제', '아직', '벌써', '지금', '나중',
  '우리', '나도', '너도', '내가', '네가', '나는', '너는', '저는', '제가', '그거', '이거', '저거', '그게', '이게', '저게', '그것',
  '이것', '무슨', '어떤', '이런', '그런', '저런', '모두', '다들', '같이', '함께', '거의', '정도', '때문', '하루', '이번', '저번',
  '처음', '마지막', '그때', '이때', '언제', '어디', '여기', '거기', '저기', '뭔가', '어떻게', '왜냐', '아무', '혹시', '역시',
  '또는', '그리', '얼마나', '것도', '거야', '거지', '있다', '없다', '했다', '한다', '된다', '됐다', '싶다', '좋다', '같다',
  '갔다', '왔다', '봤다', '먹다', '하다', '되다', '보다', '이다', '같은', '오는', '가는', '하는', '있는', '없는', '좋은',
  '많은', '많이', '이런', '어떤', '모든', '새로', 'the', 'and',
]);

function stripParticle(token) {
  for (const particle of PARTICLES) {
    if (!token.endsWith(particle)) continue;
    if (particle.length === 1 && token.length < MIN_LENGTH_FOR_ONE_CHAR) return token;
    const stem = token.slice(0, -particle.length);
    if (stem.length >= 2) return stem;
  }
  return token;
}

/** 글 하나에서 센 낱말 집합 (같은 글에 여러 번 나와도 한 번) */
export function wordsOf(text) {
  const words = new Set();
  for (const raw of String(text).toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
    // 숫자로 시작하는 말(2시, 3번째)은 세지 않는다
    if (raw.length < 2 || /^\p{N}/u.test(raw)) continue;
    if (VERB_ENDINGS.some((ending) => raw.length >= 3 && raw.endsWith(ending))) continue;
    if (raw.length >= 3 && raw.endsWith('다')) continue;
    if (raw.length === 2 && SHORT_VERB_ENDINGS.has(raw[1])) continue;
    const word = stripParticle(raw);
    if (word.length < 2 || word.length > 12 || STOPWORDS.has(word)) continue;
    words.add(word);
  }
  return words;
}

/** 여러 글에서 가장 많은 글에 나온 낱말 순서로 */
export function topWords(texts, limit = 10) {
  const counts = new Map();
  for (const text of texts) {
    for (const word of wordsOf(text)) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'))
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}
