// DearDays 데스크톱 앱
// - 학교 서버 등에 올린 DearDays 웹을 앱 창으로 연다 (항상 최신 화면, 별도 업데이트 불필요)
// - 처음 실행하면 서버 주소를 묻고 연결을 확인한 뒤 기억한다
// - 창이 뒤에 있을 때 새 소식이 오면 윈도우 알림 + 작업 표시줄 깜빡임, 안 읽은 소식 표시

const path = require('node:path');
const fs = require('node:fs');
const { app, BrowserWindow, Menu, Notification, dialog, ipcMain, nativeImage, net, session, shell } = require('electron');
const { loadConfig, normalizeServerUrl, saveConfig } = require('./config');

const APP_ID = 'app.deardays.desktop';
const ICON_PATH = path.join(__dirname, '..', 'build', 'icon.png');
const BADGE_PATH = path.join(__dirname, '..', 'build', 'badge.png');
const PAGES = path.join(__dirname, 'pages');

let mainWindow = null;
let config = null;

// 테스트·휴대용 실행: 설정과 로그인 정보를 다른 폴더에 두고 싶을 때
if (process.env.DEARDAYS_USER_DATA) app.setPath('userData', process.env.DEARDAYS_USER_DATA);

// ───────────── 서버 주소 ─────────────

const serverOrigin = () => {
  try {
    return config.serverUrl ? new URL(config.serverUrl).origin : null;
  } catch {
    return null;
  }
};

/** 서버의 /api/health 로 DearDays 서버가 맞는지 확인 (5초 제한) */
async function checkServer(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await net.fetch(`${url}/api/health`, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) return { ok: false, message: `서버가 응답했지만 상태가 좋지 않아요. (HTTP ${response.status})` };
    const body = await response.json().catch(() => null);
    if (body?.status !== 'ok') return { ok: false, message: 'DearDays 서버가 아닌 것 같아요. 주소를 다시 확인해 주세요.' };
    return { ok: true, message: '연결됐어요!' };
  } catch (error) {
    return {
      ok: false,
      message: error.name === 'AbortError' ? '응답이 없어요. 주소와 포트, 서버가 켜져 있는지 확인해 주세요.' : `연결할 수 없어요. (${error.message})`,
    };
  } finally {
    clearTimeout(timer);
  }
}

// ───────────── 창 ─────────────

function showSetup() {
  mainWindow?.loadFile(path.join(PAGES, 'setup.html'), { query: { current: config.serverUrl ?? '' } });
}

function showOffline(reason) {
  mainWindow?.loadFile(path.join(PAGES, 'offline.html'), {
    query: { server: config.serverUrl ?? '', reason: reason ?? '' },
  });
}

function openStart() {
  if (config.serverUrl) mainWindow.loadURL(config.serverUrl);
  else showSetup();
}

/** 앱 창에서 열어도 되는 주소: 앱 안의 설정 화면, 또는 설정한 DearDays 서버 */
function isAllowedUrl(url) {
  if (url.startsWith('file://')) return true;
  try {
    return new URL(url).origin === serverOrigin();
  } catch {
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 360,
    minHeight: 560,
    title: 'DearDays',
    icon: ICON_PATH,
    backgroundColor: '#f6cfda',
    autoHideMenuBar: true, // Alt 키를 누르면 메뉴가 보인다
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('focus', () => mainWindow.flashFrame(false));

  // 새 창으로 열리는 링크는 기본 브라우저로
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  // 서버 밖 주소로 이동하려 하면 앱 대신 브라우저에서 연다
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (isAllowedUrl(url)) return;
    event.preventDefault();
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
  });
  // 서버에 닿지 않으면 '연결할 수 없음' 화면 (-3: 다른 이동으로 취소된 경우는 무시)
  mainWindow.webContents.on('did-fail-load', (_event, code, description, _url, isMainFrame) => {
    if (isMainFrame && code !== -3) showOffline(description);
  });

  openStart();
}

// ───────────── 메뉴 ─────────────

function showAbout() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'DearDays 정보',
    message: `DearDays 데스크톱 ${app.getVersion()}`,
    detail: `친구와 둘이서 쓰는 교환 일기\n\n연결된 서버: ${config.serverUrl ?? '(없음)'}\nElectron ${process.versions.electron}`,
    icon: nativeImage.createFromPath(ICON_PATH),
  });
}

function buildMenu() {
  const template = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    {
      label: '파일',
      submenu: [
        { label: '서버 주소 바꾸기...', click: showSetup },
        { label: '처음 화면으로', click: openStart },
        { type: 'separator' },
        { label: '끝내기', role: 'quit' },
      ],
    },
    {
      label: '보기',
      submenu: [
        { label: '새로 고침', role: 'reload' },
        { label: '강력 새로 고침', role: 'forceReload' },
        { type: 'separator' },
        { label: '크게', role: 'zoomIn' },
        { label: '작게', role: 'zoomOut' },
        { label: '원래 크기', role: 'resetZoom' },
        { type: 'separator' },
        { label: '전체 화면', role: 'togglefullscreen' },
      ],
    },
    {
      label: '도움말',
      submenu: [{ label: '개발자 도구', role: 'toggleDevTools' }, { type: 'separator' }, { label: 'DearDays 정보', click: showAbout }],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ───────────── 웹 화면과 주고받기 ─────────────

/** 설정·연결 실패 화면(앱 안의 파일)에서 온 요청만 받는다 */
const fromLocalPage = (event) => (event.senderFrame?.url ?? '').startsWith('file://');

function registerIpc() {
  ipcMain.on('deardays:notify', (_event, { title, body }) => {
    if (!mainWindow || mainWindow.isFocused() || !Notification.isSupported()) return;
    const notification = new Notification({
      title: String(title || 'DearDays').slice(0, 80),
      body: String(body || '').slice(0, 200),
      icon: ICON_PATH,
    });
    notification.on('click', () => {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    });
    notification.show();
    mainWindow.flashFrame(true);
  });

  ipcMain.on('deardays:unread', (_event, count) => {
    if (!mainWindow) return;
    const n = Math.max(0, Math.min(999, Number(count) || 0));
    if (process.platform === 'win32') {
      mainWindow.setOverlayIcon(n > 0 ? nativeImage.createFromPath(BADGE_PATH) : null, n > 0 ? `안 읽은 새 소식 ${n}개` : '');
    } else {
      app.setBadgeCount(n);
    }
  });

  ipcMain.on('deardays:open-setup', () => showSetup());

  ipcMain.on('deardays:retry', (event) => {
    if (fromLocalPage(event)) openStart();
  });

  ipcMain.handle('deardays:test-server', async (event, input) => {
    if (!fromLocalPage(event)) return { ok: false, message: '허용되지 않은 요청이에요.' };
    const url = normalizeServerUrl(input);
    if (!url) return { ok: false, message: '주소 형식이 올바르지 않아요. 예: http://192.168.0.10:8080' };
    return { ...(await checkServer(url)), url };
  });

  ipcMain.handle('deardays:save-server', async (event, input) => {
    if (!fromLocalPage(event)) return { ok: false, message: '허용되지 않은 요청이에요.' };
    const url = normalizeServerUrl(input);
    if (!url) return { ok: false, message: '주소 형식이 올바르지 않아요. 예: http://192.168.0.10:8080' };
    const result = await checkServer(url);
    if (!result.ok) return { ...result, url };
    config = { ...config, serverUrl: url };
    saveConfig(config);
    mainWindow.loadURL(url);
    return { ...result, url };
  });
}

// ───────────── 시작 ─────────────

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    app.setAppUserModelId(APP_ID); // 윈도우 알림에 앱 이름이 제대로 나오게
    config = loadConfig();
    // DEARDAYS_SERVER 환경변수로 이번 실행만 다른 서버를 열 수 있다 (저장하지 않음)
    if (process.env.DEARDAYS_SERVER) config = { ...config, serverUrl: normalizeServerUrl(process.env.DEARDAYS_SERVER) };

    // 웹 화면이 요청하는 권한 중 알림만 허용 (카메라·위치 등은 거부)
    session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => callback(permission === 'notifications'));
    session.defaultSession.setPermissionCheckHandler((_wc, permission) => permission === 'notifications');

    registerIpc();
    buildMenu();
    createWindow();
    if (process.env.DEARDAYS_SELFTEST) runSelfTest(process.env.DEARDAYS_SELFTEST);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}

/**
 * 개발용 자체 점검: DEARDAYS_SELFTEST=결과.png 로 실행하면 화면이 뜬 뒤 캡처를 저장하고 종료한다.
 * (DEARDAYS_SERVER 로 서버 주소를 지정할 수 있다)
 */
function runSelfTest(outputFile) {
  const finish = async () => {
    await new Promise((resolve) => setTimeout(resolve, Number(process.env.DEARDAYS_SELFTEST_WAIT ?? 3000)));
    const image = await mainWindow.webContents.capturePage();
    fs.writeFileSync(outputFile, image.toPNG());
    console.log(JSON.stringify({ url: mainWindow.webContents.getURL(), title: mainWindow.getTitle(), screenshot: outputFile }));
    app.quit();
  };
  mainWindow.webContents.once('did-finish-load', finish);
}
