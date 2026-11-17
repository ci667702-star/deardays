// 데스크톱 앱 설정 (서버 주소 등). 사용자 데이터 폴더의 config.json 에 저장한다.
//  Windows: %APPDATA%\DearDays\config.json
const fs = require('node:fs');
const path = require('node:path');
const { app } = require('electron');

const configFile = () => path.join(app.getPath('userData'), 'config.json');

/** 빌드할 때 package.json 의 "deardays.defaultServer" 로 기본 서버를 넣어 둘 수 있다 */
function defaultServer() {
  try {
    return require('../package.json').deardays?.defaultServer || null;
  } catch {
    return null;
  }
}

function loadConfig() {
  try {
    return { serverUrl: defaultServer(), ...JSON.parse(fs.readFileSync(configFile(), 'utf8')) };
  } catch {
    return { serverUrl: defaultServer() };
  }
}

function saveConfig(config) {
  fs.mkdirSync(path.dirname(configFile()), { recursive: true });
  fs.writeFileSync(configFile(), JSON.stringify(config, null, 2));
}

/** 'school.ac.kr:8080' 처럼 입력해도 'http://school.ac.kr:8080' 으로. http/https 만 허용 */
function normalizeServerUrl(input) {
  let value = String(input ?? '').trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) value = `http://${value}`;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
  } catch {
    return null;
  }
}

module.exports = { loadConfig, saveConfig, normalizeServerUrl };
