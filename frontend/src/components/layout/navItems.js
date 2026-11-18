// 시작 메뉴와 작업 표시줄이 함께 쓰는 이동 경로
// taskbar 가 false 면 작업 표시줄에는 두지 않고 시작 메뉴에만 둔다.

/** 편지함은 '새 일기'의 크림색 편지와 구분되도록 민트 봉투 */
export const LETTERBOX_PALETTE = { c: '#d6fcff', p: '#d94a7a' };

export const NAV_ITEMS = [
  { to: '/', label: '홈', icon: 'heart', end: true, taskbar: true },
  { to: '/room', label: '우리 일기장', icon: 'book', taskbar: true },
  { to: '/diaries/new', label: '새 일기 쓰기', icon: 'letter', taskbar: false },
  { to: '/todos', label: '할 일', icon: 'checklist', taskbar: true },
  { to: '/letters', label: '편지함', icon: 'letter', palette: LETTERBOX_PALETTE, taskbar: false },
  { to: '/topics', label: '오늘의 주제', icon: 'note', taskbar: false },
  { to: '/calendar', label: '달력', icon: 'calendar', taskbar: true },
  { to: '/search', label: '찾기', icon: 'search', taskbar: false },
  { to: '/recap', label: '연말 결산', icon: 'trophy', taskbar: false },
  { to: '/me', label: '내 정보', icon: 'computer', taskbar: true },
];
