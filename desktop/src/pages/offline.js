// 서버에 연결하지 못했을 때 화면
const params = new URLSearchParams(location.search);
document.getElementById('server').textContent = params.get('server') || '(설정 안 됨)';
const reason = params.get('reason');
if (reason) document.getElementById('reason').textContent = `자세한 이유: ${reason}`;

document.getElementById('retry').addEventListener('click', () => window.deardaysDesktop.retry());
document.getElementById('settings').addEventListener('click', () => window.deardaysDesktop.openServerSettings());
document.getElementById('retry').focus();
