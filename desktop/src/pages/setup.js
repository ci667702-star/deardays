// 서버 주소 입력 화면
const params = new URLSearchParams(location.search);
const input = document.getElementById('server');
const status = document.getElementById('status');
const form = document.getElementById('form');
const testButton = document.getElementById('test');
const saveButton = document.getElementById('save');

input.value = params.get('current') || '';

function show(message, tone) {
  status.textContent = message;
  status.className = `hint ${tone ?? ''}`;
}

function busy(isBusy) {
  testButton.disabled = isBusy;
  saveButton.disabled = isBusy;
}

testButton.addEventListener('click', async () => {
  if (!input.value.trim()) return show('서버 주소를 입력해 주세요.', 'error');
  busy(true);
  show('연결을 확인하는 중...');
  const result = await window.deardaysDesktop.testServer(input.value);
  busy(false);
  if (result.url) input.value = result.url;
  show(result.message, result.ok ? 'ok' : 'error');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!input.value.trim()) return show('서버 주소를 입력해 주세요.', 'error');
  busy(true);
  show('연결하는 중...');
  const result = await window.deardaysDesktop.saveServer(input.value);
  if (!result.ok) {
    busy(false);
    if (result.url) input.value = result.url;
    show(result.message, 'error');
  }
  // 성공하면 앱이 서버 화면으로 바로 이동한다
});
