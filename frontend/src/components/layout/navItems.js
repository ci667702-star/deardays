// 시작 메뉴, 작업 표시줄, 바탕화면 아이콘이 함께 쓰는 이동 경로
// desktopLabel 이 없으면 바탕화면에 아이콘을 두지 않고, taskbar 가 false 면 작업 표시줄에 두지 않는다.

/** 편지함은 '새 일기'의 크림색 편지와 구분되도록 라벤더 봉투 */
export const LETTERBOX_PALETTE = { c: '#d9cdf2', p: '#c24f7e' };

export const NAV_ITEMS = [
  { to: '/', label: '홈', desktopLabel: null, icon: 'heart', end: true, taskbar: true },
  { to: '/room', label: '우리 일기장', desktopLabel: '우리 일기장', icon: 'book', taskbar: true },
  { to: '/diaries/new', label: '새 일기 쓰기', desktopLabel: '새 일기.txt', icon: 'letter', taskbar: false },
  { to: '/todos', label: '할 일', desktopLabel: '할 일.txt', icon: 'checklist', taskbar: true },
  { to: '/letters', label: '편지함', desktopLabel: '편지함', icon: 'letter', palette: LETTERBOX_PALETTE, taskbar: false },
  { to: '/calendar', label: '달력', desktopLabel: '달력', icon: 'calendar', taskbar: true },
  { to: '/search', label: '찾기', desktopLabel: null, icon: 'search', taskbar: false },
  { to: '/me', label: '내 정보', desktopLabel: '내 컴퓨터', icon: 'computer', taskbar: true },
];
