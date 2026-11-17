// 웹 화면에 꼭 필요한 기능만 window.deardaysDesktop 으로 열어 준다. (Node 기능은 노출하지 않음)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('deardaysDesktop', {
  isDesktop: true,
  platform: process.platform,

  /** 창이 뒤에 있을 때 윈도우 알림으로 새 소식을 보여 준다 */
  notify: (title, body) => ipcRenderer.send('deardays:notify', { title: String(title ?? ''), body: String(body ?? '') }),

  /** 작업 표시줄 아이콘에 안 읽은 소식 표시 */
  setUnread: (count) => ipcRenderer.send('deardays:unread', Number(count) || 0),

  /** 서버 주소 설정 화면 열기 */
  openServerSettings: () => ipcRenderer.send('deardays:open-setup'),

  // 아래는 앱 안의 설정·연결 실패 화면에서만 동작 (원격 페이지에서 부르면 무시됨)
  testServer: (url) => ipcRenderer.invoke('deardays:test-server', url),
  saveServer: (url) => ipcRenderer.invoke('deardays:save-server', url),
  retry: () => ipcRenderer.send('deardays:retry'),
});
