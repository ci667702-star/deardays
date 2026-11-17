// 시작 메뉴, 작업 표시줄, 바탕화면 아이콘이 함께 쓰는 이동 경로
export const NAV_ITEMS = [
  { to: '/', label: '홈', desktopLabel: null, icon: 'heart', end: true, taskbar: true },
  { to: '/room', label: '우리 일기장', desktopLabel: '우리 일기장', icon: 'book', taskbar: true },
  { to: '/diaries/new', label: '새 일기 쓰기', desktopLabel: '새 일기.txt', icon: 'letter', taskbar: false },
  { to: '/calendar', label: '달력', desktopLabel: '달력', icon: 'calendar', taskbar: true },
  { to: '/me', label: '내 정보', desktopLabel: '내 컴퓨터', icon: 'computer', taskbar: true },
];
