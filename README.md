# DearDays

친구와 함께 쓰는 교환 일기입니다. 옛 윈도우 창 모양을 그대로 살린 웹 앱이에요.

공유 공간을 만들고 초대 코드로 친구를 부르면 공간 사람들만 볼 수 있는 일기장이 열립니다. 한 공간에는 **최대 6명**까지 함께할 수 있어요. 일기에 사진과 손으로 그린 낙서를 붙이고, 서로의 일기에 공감·댓글·도장을 남길 수 있습니다. 매일 열리는 '오늘의 주제'로 같은 글감에 함께 쓰고, 연말에는 함께 보낸 한 해를 결산 마법사로 돌아봅니다.

**쓸 수 있는 곳**

- **웹 브라우저**: 컴퓨터, 태블릿, 휴대폰 화면 크기에 맞춰 바뀝니다(반응형).
- **휴대폰 홈 화면**: 브라우저 메뉴의 "홈 화면에 추가"로 앱처럼 띄울 수 있습니다.
- **Windows 데스크톱 앱**: 설치 파일(.exe)로 깔고 새 소식이 오면 윈도우 알림을 받습니다.

## 목차

1. [기능 한눈에 보기](#기능-한눈에-보기)
2. [내 컴퓨터에서 실행하기 (개발용)](#내-컴퓨터에서-실행하기-개발용)
3. [서버에 배포하기 (Docker)](#서버에-배포하기-docker)
   - [화면만 Vercel 에 올리기 (선택)](#화면만-vercel-에-올리기-선택)
4. [데스크톱 앱 (Windows)](#데스크톱-앱-windows)
5. [휴대폰에서 쓰기](#휴대폰에서-쓰기) · [안드로이드 앱 (APK)](#안드로이드-앱-apk)
6. [관리자: 주제 편집과 문의함](#관리자-주제-편집과-문의함) · [휴대폰 알림 켜기](#휴대폰-알림-켜기)
7. [성능 최적화](#성능-최적화)
8. [기술 스택](#기술-스택) · [폴더 구조](#폴더-구조) · [API 목록](#api-목록) · [보안과 규칙](#보안과-규칙) · [테스트](#테스트) · [디자인 노트](#디자인-노트)

---

## 기능 한눈에 보기

| 화면 | 하는 일 |
| --- | --- |
| 로그인 · 회원가입 | 이메일 가입, 이메일 중복 확인, 로그인 상태 유지 선택 |
| 홈 (바탕 화면) | 오늘 날짜와 오늘의 한마디, **오늘의 주제**(누가 썼는지 표시), 달력 미리보기, 최근 일기 5편. 아직 혼자면 최근 일기 창의 '친구 초대'로 초대 코드 창(함께한 날 D+N, 함께 쓰는 사람, 초대 코드). 12월~1월 중순에는 결산 마법사 안내. 넓은 모니터에서는 양옆에 작은 창([반응형 화면](#반응형-화면)) |
| 우리 일기장 | 함께 쓰는 사람 프로필(최대 6명, 지금 인원/6 표시), 초대 코드 복사·재발급, 일기 목록(최신순/과거순, 더 보기), 공간 이름 변경, 공간 나가기, 다른 공간 만들기/참여 |
| 일기 쓰기·수정 | 제목, 날짜, 기분(기쁨·설렘·평온·우울·화남)과 날씨 도트 아이콘, 줄 노트 본문, 사진 최대 6장(끌어다 놓기 지원), **낙서 창**(320×200 도트 그림: 연필·지우개·채우기, 굵기 4단계, 16색, 되돌리기), 주제로 쓰기, 업로드 진행률, 작성 중 이탈 확인, **자동 임시 저장**(다시 열면 "이어서 쓸까요?") |
| 일기 보기 | 작성자·날짜·기분·날씨, 오늘의 주제, 본문, 낙서, 사진 크게 보기, 하트 공감/취소, **도장 찍기**(친구 일기에 '참 잘했어요'·'대박'·'ㅋㅋㅋ'·'토닥토닥'·'나도 나도'·'최고', 다시 누르면 떼기), 댓글 작성·수정·삭제 (작성자 본인만), 댓글에 **얼굴 이모티콘**(기쁨·설렘·평온·우울·화남·반함·놀람·웃김 8가지 도트 얼굴, 글 없이 얼굴만 달아도 됨), **답글**(댓글마다 '답글'로 그 아래에 달기, 답글에 답하면 '@이름'이 미리 채워짐) |
| 오늘의 주제 (하루 하나 글쓰기) | 날마다 열리는 글감. 관리자가 넣지 않은 날은 서버의 글감 목록(116개, "만약 좀비가 나타난다면?" 같은 것)에서 자동으로 하나가 열려 하루도 비지 않음. 오늘 주제와 누가 썼는지, 지난 주제 모아 보기와 지난 주제로 쓰기. 주제는 관리자가 **관리자 화면**에서 넣고 고침 ([관리자](#관리자-주제-편집과-문의함)) |
| 연말 결산 | 옛 설치 마법사 모양의 "우리의 한 해". 숫자로 본 한 해, 누가 더 많이 썼나, 달별 일기 수, 가장 길게 이어 쓴 날, 한 해의 기분, 자주 쓴 낱말, 기억에 남는 일기 |
| 새 소식 | 작업 표시줄의 종에 안 읽은 개수, 새 소식이 오면 말풍선. 친구의 새 일기·댓글·공감·도장, 맡긴 할 일, 친구 참여, 편지 보냄·도착·읽음. 누르면 해당 화면으로, 일기를 열면 그 알림은 자동으로 읽음 |
| 편지함 (타임캡슐) | 친구나 미래의 나에게 편지를 봉인해 보내기. 여는 날 전에는 받는 사람도 제목·내용을 볼 수 없고(D-day 표시), 그날이 되면 도착 알림. 친구가 열면 보낸 사람에게 알림. 열기 전 '보내기 취소' |
| 찾기 | 옛 윈도우 '찾기' 창. 제목·내용 낱말, 쓴 사람, 날짜 범위로 일기 찾기, 찾은 낱말 강조 |
| 할 일 | 공간 사람들이 함께 보는 할 일 목록. 기한(선택)과 맡을 사람(함께 또는 공간 사람 중 한 명), 누구든 체크, 누가 끝냈는지 기록, 기한 지남·오늘·내일 강조, 남은 일/끝낸 일/전체 탭, 진행 막대 |
| 달력 | 월 이동, 오늘 강조, 내가 쓴 날(분홍)과 친구가 쓴 날(민트). 기분을 골랐으면 그 표정의 얼굴로, 아니면 하트로 표시. 날짜별 일기, 그 날짜로 일기 쓰기. **기념일 D-day**: 생일·시험·여행 날짜를 넣으면(해마다 반복 선택) 달력에 케이크로 표시되고 "D-12"처럼 남은 날을 셈, 공간 사람 모두에게 보임 |
| 화면 보호기 | 정해 둔 시간(1~15분, 기본 5분) 동안 가만히 있으면 공간에 올린 사진과 낙서가 검은 화면을 떠다님. 마우스를 움직이거나 누르면 돌아옴. 시작 메뉴 → 화면 설정 → 화면 보호기 탭에서 끄거나 미리 보기 |
| 휴대폰 알림 | 친구가 일기·댓글·답글·도장을 남기면 휴대폰(또는 PC 브라우저)으로 푸시 알림. 내 정보 → 휴대폰 알림에서 기기마다 켜고 끔, 시험 알림 보내기. 로그아웃하면 그 기기 알림은 꺼짐 ([켜는 법](#휴대폰-알림-켜기)) |
| 내 정보 | 프로필 사진 변경/기본 이미지로, 닉네임·자기소개 수정, 이메일 확인, 작성 통계, 참여 공간 목록, 화면 설정, 휴대폰 알림, **문의하기**(종류: 오류 신고·기능 제안·계정·기타, 내가 보낸 문의와 관리자 답변 보기, 지우기), **비밀번호 바꾸기**(다른 기기는 로그아웃), **회원 탈퇴**, 로그아웃 |
| 관리자 (`/admin`) | 관리자 비밀번호를 넣은 계정만. **오늘의 주제** 탭: 하루 하나 글쓰기 주제 넣기(한 줄에 하나씩 여러 개)·고치기·지우기. **문의함** 탭: 확인 전 / 처리함 / 전체, 보낸 사람과 이메일, 답변 쓰기, 답변 없이 처리함, 다시 확인 전으로, 지우기 |

---

## 내 컴퓨터에서 실행하기 (개발용)

코드를 고치거나 내 컴퓨터에서 먼저 써 보고 싶을 때의 방법입니다. **서버에 올려서 친구와 같이 쓰려면** [서버에 배포하기 (Docker)](#서버에-배포하기-docker)로 가세요.

처음 한 번은 아래 1~7단계를 순서대로 따라 하면 됩니다. 명령어는 **PowerShell, Git Bash, macOS 터미널** 어디서나 같습니다.

### 1. 준비물 확인

| 필요한 것 | 확인 방법 |
| --- | --- |
| Node.js 20 이상 | `node -v` → `v20` 이상이면 OK. 없으면 https://nodejs.org 에서 LTS 설치 |
| MySQL 8 (켜져 있어야 함) | Windows: PowerShell에서 `Get-Service MySQL80` → `Running` 이면 OK |
| MySQL 비밀번호 | 설치할 때 정한 `root` 비밀번호 |
| Git | `git --version` |

> MySQL이 꺼져 있으면(`Stopped`) **관리자 권한** PowerShell에서 `net start MySQL80` 으로 켜세요.

### 2. 코드 받기

```bash
git clone https://github.com/ci667702-star/deardays.git
```

```bash
cd deardays
```

> 비공개 저장소라서, 다른 사람이 받으려면 GitHub 저장소 Settings → Collaborators 에서 초대해야 합니다.

### 3. 패키지 설치

`deardays` 폴더(맨 위)에서 한 번만 실행하면 backend, frontend 패키지까지 모두 설치됩니다.

```bash
npm install
```

### 4. 환경변수 파일 만들기

```bash
npm run setup:env
```

`backend/.env` 파일이 생깁니다. 이 파일을 메모장이나 VS Code로 열어 **딱 한 곳**만 고치세요.

```env
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/deardays"
```

`YOUR_MYSQL_PASSWORD` 를 내 MySQL `root` 비밀번호로 바꿉니다. 예를 들어 비밀번호가 `1234` 라면:

```env
DATABASE_URL="mysql://root:1234@localhost:3306/deardays"
```

> 비밀번호에 `@ : / # %` 같은 특수문자가 있으면 바꿔 써야 합니다. `@` → `%40`, `#` → `%23`, `%` → `%25`, `/` → `%2F`, `:` → `%3A`
> (예: 비밀번호 `pass@123` → `root:pass%40123@localhost`)

`JWT_SECRET` 은 `setup:env` 가 임의 값으로 채워 두었으니 그대로 두면 됩니다. `.env` 파일은 git에 올라가지 않습니다.

### 5. 데이터베이스 테이블 만들기

```bash
npm run db:migrate
```

`deardays` 데이터베이스가 없으면 새로 만들고, 테이블 15개(users, diary_rooms, diary_room_members, diaries, diary_images, comments, likes, stamps, daily_topics, anniversaries, push_subscriptions, todos, notifications, letters, inquiries)를 생성합니다.

> 깜빡해도 괜찮습니다. 7단계의 `npm run dev` 가 서버를 켜기 전에 이 명령을 먼저 실행해, 없는 테이블을 만들어 줍니다.
`All migrations have been successfully applied.` 가 나오면 성공입니다.

### 6. (선택) 체험용 데이터 넣기

```bash
npm run db:seed
```

서로 연결된 계정 두 개와 일기 4편, 할 일 4개, 그저께부터 모레까지의 '오늘의 주제' 5개가 만들어집니다. 바로 둘러보고 싶을 때 쓰세요. 여러 번 실행해도 중복으로 만들어지지 않습니다.

| 이메일 | 비밀번호 | 닉네임 |
| --- | --- | --- |
| `haru@deardays.test` | `diary1234` | 하루 |
| `byeol@deardays.test` | `diary1234` | 별이 |

> 내 컴퓨터에서만 쓰는 체험용 계정입니다. 실제 서비스로 공개할 때는 시드를 넣지 마세요.

### 7. 실행

```bash
npm run dev
```

API 서버를 켜기 전에 DB 테이블을 최신 상태로 맞추고(이미 있으면 건너뜀, 데이터는 지우지 않음), API 서버와 화면 서버를 한 터미널에서 같이 켭니다. 아래 줄들이 보이면 준비 완료입니다.

```
[api] [DearDays] API 서버가 http://localhost:4000 에서 실행 중입니다.
[api] [DearDays] MySQL 연결 확인 완료
[web]   ➜  Local:   http://localhost:5173/
```

브라우저에서 **http://localhost:5173** 을 엽니다. 끌 때는 터미널에서 `Ctrl + C` 를 누르세요.

### 다음부터 실행할 때

설치와 설정은 한 번이면 됩니다. 다음부터는 `deardays` 폴더에서 이것만 실행하세요.

```bash
npm run dev
```

코드를 새로 받아 왔다면(`git pull`) 패키지가 바뀌었을 수 있으니 한 번 더 설치합니다. 새로 생긴 테이블은 `npm run dev` 가 켜질 때 알아서 만듭니다.

```bash
npm install
```

### 여럿이 써 보기

한 브라우저에서는 한 계정만 로그인됩니다. 두 번째 사람부터는 **다른 브라우저**나 **시크릿 창**(Chrome: `Ctrl + Shift + N`)으로 접속하세요.

1. A가 회원가입 → 홈에서 **새 공간 만들기** → 초대 코드 **복사**
2. B(그리고 C, D…)가 회원가입 → **초대 코드로 참여** 탭에 코드 입력. 한 공간에는 6명까지 들어올 수 있어요.
3. 서로 일기를 쓰고 공감과 댓글, 도장을 남깁니다. 다른 탭에 갔다 돌아오면 친구의 새 일기가 반영됩니다.

> 한 사람이 공간을 여러 개 가질 수도 있어요. (예: 반 친구들 공간, 단짝 공간) 우리 일기장 화면의 **다른 공간**에서 만들거나 참여하고, 보고 있는 공간을 바꿉니다.

> 같은 와이파이의 휴대폰으로 접속해 보고 싶다면 `frontend/vite.config.js` 의 `server` 에 `host: true` 를 추가하고 `npm run dev` 를 다시 실행하세요. 터미널에 나오는 `Network: http://192.168.x.x:5173/` 주소를 휴대폰에서 열면 됩니다. (Windows 방화벽이 물어보면 '허용')

### 명령어 모음

모두 `deardays` 폴더(맨 위)에서 실행합니다.

| 명령어 | 하는 일 |
| --- | --- |
| `npm install` | backend, frontend 패키지까지 모두 설치 |
| `npm run setup:env` | `backend/.env` 만들기 (이미 있으면 건드리지 않음) |
| `npm run db:migrate` | DB 테이블 만들기/갱신 |
| `npm run db:seed` | 체험용 계정과 일기 넣기 |
| `npm run dev` | API 서버(4000)와 화면(5173)을 같이 실행 |
| `npm run dev:api` | API 서버만 실행 |
| `npm run dev:web` | 화면만 실행 |
| `npm run test:api` | API 통합 테스트 (API 서버를 켠 상태에서) |
| `npm run build:web` | 배포용 화면 빌드 (`frontend/dist`) |

### 문제 해결

| 증상 | 해결 방법 |
| --- | --- |
| `YOUR_MYSQL_PASSWORD 가 그대로 있어요` | 4단계: `backend/.env` 의 비밀번호 자리를 실제 비밀번호로 바꾸고 다시 실행 |
| `P1000: Authentication failed` | 비밀번호가 틀렸거나, 특수문자를 바꿔 쓰지 않았습니다 (4단계 참고) |
| `P1001: Can't reach database server` | MySQL이 꺼져 있습니다. 관리자 PowerShell에서 `net start MySQL80` |
| `The table ... does not exist` (가입·로그인이 안 됨) | DB에 테이블이 없습니다. `npm run db:migrate` 를 실행하세요. `npm run dev` 로 켜면 자동으로 실행됩니다 |
| `DB 테이블을 최신 상태로 맞추지 못했어요` | `npm run dev` 가 켜지기 전 테이블 만들기에 실패했습니다. 바로 위에 나온 Prisma 오류(P1000, P1001 등)를 이 표에서 찾아 고치세요 |
| `환경변수 ... 이(가) 비어 있습니다` | `backend/.env` 가 없습니다. `npm run setup:env` 실행 |
| `4000번 포트를 이미 다른 프로그램이 쓰고 있어요` | 이미 켜 둔 서버가 있습니다. 그 터미널에서 `Ctrl + C`. 어떤 프로그램인지 모르면 PowerShell에서 `Get-NetTCPConnection -LocalPort 4000` 으로 확인 |
| `npm install` 중 `EPERM ... query_engine-windows.dll.node` | API 서버가 켜져 있어서 파일이 잠겼습니다. 서버를 끄고(`Ctrl + C`) 다시 `npm install` |
| 화면에 "서버에 연결할 수 없어요" | API 서버가 꺼져 있습니다. `npm run dev` 터미널에 `[api]` 오류가 있는지 확인 |
| "시도가 너무 많아요" | 로그인 실패나 가입을 짧은 시간에 많이 했습니다. 15분 뒤 다시 하거나, 개발 중에는 `.env` 의 `AUTH_RATE_LIMIT` 를 늘리기 |
| 화면이 예전 모습 그대로 | 브라우저에서 `Ctrl + F5` (강력 새로 고침) |

<details>
<summary>root 대신 DearDays 전용 MySQL 계정을 쓰고 싶다면</summary>

MySQL Workbench나 아래 명령으로 접속합니다. (Windows에서 `mysql` 명령이 없다고 나오면 전체 경로로 실행)

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

접속한 뒤 실행할 SQL입니다. 비밀번호는 직접 정하세요.

```sql
CREATE DATABASE deardays CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'deardays'@'localhost' IDENTIFIED BY '여기에-비밀번호';
GRANT ALL PRIVILEGES ON deardays.* TO 'deardays'@'localhost';
FLUSH PRIVILEGES;
```

그리고 `backend/.env` 를 이렇게 바꿉니다.

```env
DATABASE_URL="mysql://deardays:여기에-비밀번호@localhost:3306/deardays"
```

스키마를 고쳐 `npx prisma migrate dev` 로 새 마이그레이션을 만들 때는 Prisma가 임시 비교용 DB를 만들기 때문에, DB 생성 권한이 있는 계정(예: root)이 필요합니다. 설치·실행에 쓰는 `npm run db:migrate` 에는 필요 없습니다.

</details>

---

## 서버에 배포하기 (Docker)

학교 서버처럼 항상 켜져 있는 컴퓨터에 올려서 친구와 같이 쓰는 방법입니다. 서버에는 **Docker만 있으면 됩니다.** Node.js나 MySQL은 따로 설치하지 않아도 Docker가 알아서 띄웁니다.

### 전체 구조

`docker compose up` 한 번으로 컨테이너 세 개가 뜹니다. 바깥(인터넷·학교망)으로 열리는 포트는 `web` 하나뿐이고, `api` 와 `db` 는 Docker 내부망에서만 서로 이야기합니다.

```
 브라우저 / 휴대폰 / 데스크톱 앱
            │  http://서버주소:WEB_PORT
            ▼
 ┌──────────────────────── 서버 (Docker) ────────────────────────┐
 │  web  (nginx)                                                 │
 │   ├─ /            → 화면 파일 (React 빌드 결과)               │
 │   ├─ /api/...     ─┐                                          │
 │   └─ /uploads/... ─┴→ api  (Node.js, 4000번)                  │
 │                         ├─ 사진 저장 → [uploads 볼륨]          │
 │                         └─ DB 접속  → db (MySQL 8.4)          │
 │                                        └─ 데이터 → [db-data 볼륨] │
 └───────────────────────────────────────────────────────────────┘
```

- **볼륨**: 컨테이너를 지우고 다시 만들어도 남는 저장 공간입니다. 일기 데이터(`db-data`)와 사진(`uploads`)이 여기에 있으므로, 업데이트나 재시작을 해도 사라지지 않습니다.
- **자동 마이그레이션**: `api` 가 켜질 때마다 `prisma migrate deploy` 를 먼저 실행해 DB 테이블을 최신 상태로 맞춥니다. 직접 할 일이 없습니다.
- **켜지는 순서**: `db` 가 정상 응답할 때까지 `api` 가 기다리고, `api` 가 정상이 되면 `web` 이 뜹니다(헬스체크). 서버가 재부팅되면 셋 다 자동으로 다시 켜집니다(`restart: unless-stopped`).

### 1단계. 서버 준비

| 항목 | 최소 | 권장 |
| --- | --- | --- |
| 운영체제 | Docker가 돌아가는 Linux (Ubuntu 22.04/24.04 등) | Ubuntu 24.04 |
| CPU / 메모리 | 1코어 / 1GB | 2코어 / 2GB |
| 디스크 | 5GB (이미지 약 1.5GB + 데이터) | 사진이 쌓이므로 20GB 이상 |
| 소프트웨어 | Docker Engine 24 이상 + Compose v2 | 최신 Docker |

**Docker 설치 확인**

```bash
docker --version
```

```bash
docker compose version
```

`Docker Compose version v2.x` 처럼 나오면 됩니다. `docker-compose`(하이픈)만 있는 옛 버전이라면 아래처럼 새로 설치하세요.

**Docker 설치 (Ubuntu, 관리자 권한 필요)**

```bash
curl -fsSL https://get.docker.com | sudo sh
```

```bash
sudo usermod -aG docker $USER
```

두 번째 명령은 `sudo` 없이 `docker` 를 쓰게 해 줍니다. **로그아웃했다가 다시 접속**해야 적용됩니다. 학교 서버라 관리자 권한이 없다면 서버 담당 선생님께 "Docker와 Docker Compose 설치, 그리고 제 계정을 docker 그룹에 추가"를 부탁하세요.

> Windows나 macOS 컴퓨터를 서버로 쓸 때는 [Docker Desktop](https://www.docker.com/products/docker-desktop/)을 설치하면 아래 명령을 그대로 쓸 수 있습니다.

### 2단계. 코드 받기

```bash
git clone https://github.com/ci667702-star/deardays.git
```

```bash
cd deardays
```

> 비공개 저장소이므로 서버에서 받을 때는 GitHub 로그인이 필요합니다. 비밀번호 대신 [Personal Access Token](https://github.com/settings/tokens)을 입력하세요.

### 3단계. `.env` 파일 만들기

`deardays` 폴더(맨 위, `docker-compose.yml` 이 있는 곳)에서 예시 파일을 복사합니다.

```bash
cp .env.example .env
```

`nano .env` (또는 `vi .env`)로 열어 값을 채웁니다. 각 값이 하는 일은 이렇습니다.

| 변수 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `RDB_DATABASE` | | `deardays` | MySQL 데이터베이스 이름 |
| `RDB_USERNAME` | | `deardays` | 앱이 DB에 접속할 때 쓰는 계정 이름. **`root` 는 쓸 수 없습니다** (MySQL이 거부) |
| `RDB_PASSWORD` | ✅ | | 위 계정의 비밀번호. 특수문자도 됩니다 (`$` `#` 공백이 있으면 값을 `'작은따옴표'` 로 감싸기) |
| `RDB_ROOT_PASSWORD` | ✅ | | MySQL 관리자(root) 비밀번호. 백업할 때 씁니다 |
| `JWT_SECRET` | ✅ | | 로그인 토큰 서명 키. **32자 이상** 무작위 문자열 |
| `WEB_PORT` | | `80` | 브라우저로 접속할 포트. 80을 이미 쓰고 있으면 `8080` 등 |
| `PUBLIC_URL` | | `http://localhost` | 사람들이 접속하는 주소 (예: `http://10.20.30.40:8080`) |
| `AUTH_RATE_LIMIT` | | `30` | 15분 동안 한 IP에서 허용할 로그인 실패·회원가입 횟수 |
| `TRUST_PROXY` | | `1` | 앞에 있는 프록시 수. 그대로 두고, [HTTPS 프록시](#9단계-선택-https-붙이기)를 하나 더 두면 `2` |
| `EXTRA_ORIGINS` | | (비어 있음) | 화면을 [Vercel](#화면만-vercel-에-올리기-선택) 같은 다른 곳에도 올렸다면 그 주소. 쉼표로 여러 개, 끝에 `/` 없이 |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | | (비어 있음) | 휴대폰 푸시 알림 키. 비우면 휴대폰 알림만 꺼집니다 ([켜는 법](#휴대폰-알림-켜기)) |
| `VAPID_SUBJECT` | | (비어 있음) | 푸시 서비스가 연락할 주소 (`mailto:이메일` 또는 `https://주소`). 비워도 됩니다 |
| `ADMIN_PASSWORD` | | (비어 있음) | 관리자 비밀번호, **8자 이상**. 앱에서 이 값을 넣은 계정이 오늘의 주제를 관리하고 문의함을 봅니다. 비우면 관리자 기능이 꺼집니다 ([관리자](#관리자-주제-편집과-문의함)) |

**비밀번호와 키 만들기**: 직접 지어도 되지만, 아래 명령으로 무작위 값을 만들면 안전합니다. 나온 값을 복사해 `.env` 에 붙여 넣으세요. (세 값은 서로 다르게)

```bash
openssl rand -hex 24
```

```bash
openssl rand -hex 48
```

첫 번째는 `RDB_PASSWORD`, `RDB_ROOT_PASSWORD` 용(48자), 두 번째는 `JWT_SECRET` 용(96자)입니다. `openssl` 이 없는 Windows PowerShell에서는 이렇게 만듭니다.

```powershell
-join (1..2 | ForEach-Object { [guid]::NewGuid().ToString('N') })
```

다 채운 `.env` 는 이런 모양입니다. (값은 예시이니 그대로 쓰지 마세요)

```env
RDB_DATABASE=deardays
RDB_USERNAME=deardays
RDB_PASSWORD=3f9a1c...(영문·숫자 48자)
RDB_ROOT_PASSWORD=8b27e0...(영문·숫자 48자)
JWT_SECRET=c41d9e...(96자)
WEB_PORT=8080
PUBLIC_URL=http://10.20.30.40:8080
AUTH_RATE_LIMIT=30
TRUST_PROXY=1
ADMIN_PASSWORD=5e0b7a...(영문·숫자 24자 이상 권장)
```

> ⚠️ `.env` 에는 비밀번호가 들어 있으니 **git에 올리지 마세요** (`.gitignore` 에 이미 들어 있습니다). 다른 사람과 공유하지 말고, 서버에만 두세요.
>
> ⚠️ `RDB_*` 값은 **처음 실행할 때 한 번만** MySQL에 적용됩니다. 첫 실행 뒤에 `.env` 의 DB 비밀번호를 바꾸면 `api` 가 DB에 접속하지 못합니다. 바꿔야 한다면 [배포 문제 해결](#배포-문제-해결)을 보세요.

### 4단계. 실행

```bash
docker compose up -d --build
```

- `--build`: `backend/Dockerfile`, `frontend/Dockerfile` 로 이미지를 만듭니다.
- `-d`: 백그라운드로 실행합니다. 터미널을 닫아도 계속 돌아갑니다.

처음에는 이미지를 받고 빌드하느라 **3~10분** 걸립니다. 다음부터는 바뀐 부분만 빌드해서 빠릅니다.

### 5단계. 잘 떴는지 확인

```bash
docker compose ps
```

세 컨테이너가 모두 `Up` 이고 `db`, `api` 옆에 `(healthy)` 가 보이면 성공입니다.

```
NAME              SERVICE   STATUS                    PORTS
deardays-api-1    api       Up 1 minute (healthy)     4000/tcp
deardays-db-1     db        Up 2 minutes (healthy)    3306/tcp, 33060/tcp
deardays-web-1    web       Up 1 minute               0.0.0.0:8080->80/tcp
```

서버 안에서 API까지 연결되는지 확인합니다. (`8080` 은 내 `WEB_PORT` 로)

```bash
curl http://localhost:8080/api/health
```

`{"status":"ok","time":"..."}` 가 나오면 화면(nginx) → API → DB가 모두 이어진 것입니다. (DB에 닿지 않으면 `status` 가 `ok` 가 아니라 오류로 응답합니다)

`api` 가 계속 `(health: starting)` 이거나 `Restarting` 이면 로그를 봅니다.

```bash
docker compose logs --tail=100 api
```

### 6단계. 접속하고 시작하기

1. 브라우저에서 `http://서버주소:WEB_PORT` 를 엽니다. (예: `http://10.20.30.40:8080`, 포트가 80이면 생략 가능)
2. 회원가입 → **새 공간 만들기** → 초대 코드를 친구에게 보냅니다.
3. 친구도 같은 주소로 가입하고 **초대 코드로 참여**하면 끝입니다.

**접속이 안 되면 방화벽을 확인하세요.** 서버의 방화벽(ufw)이 켜져 있다면 포트를 열어야 합니다.

```bash
sudo ufw allow 8080/tcp
```

학교망 밖(집)에서 접속하려면 학교 네트워크에서 그 포트가 바깥으로 열려 있어야 합니다. 이 부분은 서버 담당자에게 문의하세요.

### 7단계. 업데이트하기

GitHub에 새 코드를 올린 뒤, 서버에서 받아서 다시 빌드합니다. **데이터와 사진은 그대로 남고**, DB 테이블 변경도 자동으로 적용됩니다.

```bash
git pull
```

```bash
docker compose up -d --build
```

예전 이미지가 디스크를 차지하므로 가끔 정리해 주세요.

```bash
docker image prune -f
```

### 8단계. 백업과 복원

일기(DB)와 사진(uploads)은 따로 백업합니다. **정기적으로** 해 두고, 백업 파일은 서버 밖(내 컴퓨터, 클라우드)에도 복사해 두세요.

**DB 백업** → `backup-날짜.sql` 파일이 생깁니다.

```bash
docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqldump --single-transaction -u root "$MYSQL_DATABASE"' > backup-$(date +%F).sql
```

**사진 백업** → `uploads-backup` 폴더에 복사됩니다.

```bash
docker compose cp api:/data/uploads ./uploads-backup
```

**DB 복원** (현재 DB 내용을 백업 파일 내용으로 덮어씁니다)

```bash
docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -u root "$MYSQL_DATABASE"' < backup-2026-01-01.sql
```

**사진 복원** (복사한 뒤 파일 주인을 앱 계정으로 바꿔 줘야 새 사진을 올릴 수 있습니다)

```bash
docker compose cp ./uploads-backup/. api:/data/uploads/
```

```bash
docker compose exec -u root api chown -R node:node /data/uploads
```

**매일 자동 백업 (선택)**: `deardays` 폴더 안에 `backups` 폴더를 만들고 `crontab -e` 에 아래 한 줄을 추가하면 매일 새벽 4시에 DB를 백업합니다. `/home/나/deardays` 는 실제 경로로 바꾸세요. (crontab 안에서는 `%` 앞에 `\` 를 붙여야 합니다)

```
0 4 * * * cd /home/나/deardays && docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqldump --single-transaction -u root "$MYSQL_DATABASE"' > backups/db-$(date +\%F).sql
```

### 9단계. (선택) HTTPS 붙이기

`http://` 로도 잘 동작합니다. 다만 휴대폰에서 **앱처럼 설치**하거나, 학교 밖 인터넷으로 공개할 때는 HTTPS를 권합니다. 도메인(예: `deardays.example.kr`)이 서버를 가리키고 있어야 인증서를 받을 수 있습니다.

**방법 A. 학교에 이미 웹 서버(nginx 등)가 있을 때**: 담당자에게 아래 설정을 부탁하세요. 사진 업로드 때문에 요청 크기 제한을 꼭 늘려야 합니다.

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;          # DearDays 의 WEB_PORT
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 40m;                  # 일기 한 편에 사진 6장 × 5MB
}
```

**방법 B. Caddy로 직접 붙일 때**: [Caddy](https://caddyserver.com/docs/install)를 설치하고 `/etc/caddy/Caddyfile` 에 아래처럼 적으면 인증서를 자동으로 받아 갱신합니다.

```
deardays.example.kr {
    reverse_proxy 127.0.0.1:8080
}
```

어느 방법이든 프록시를 하나 더 두었으니 `.env` 를 이렇게 바꾸고 다시 실행합니다.

```env
# 8080 을 서버 안에서만 열어, 프록시를 거치지 않는 접속을 막는다
WEB_PORT=127.0.0.1:8080
PUBLIC_URL=https://deardays.example.kr
# 프록시가 2개 (HTTPS 프록시 → nginx). 로그인 시도 제한이 사용자 IP를 제대로 알아본다
TRUST_PROXY=2
```

```bash
docker compose up -d
```

### `docker-compose.yml` 자세히 보기

```yaml
services:
  db:                                   # MySQL 8.4
    image: mysql:8.4
    environment:                        # 처음 실행할 때 DB·계정을 만든다 (.env 의 RDB_* 값)
      MYSQL_ROOT_PASSWORD: ${RDB_ROOT_PASSWORD:?...}   # :? → 비어 있으면 실행을 멈추고 안내
      MYSQL_DATABASE: ${RDB_DATABASE:-deardays}        # :- → 비어 있으면 기본값
      MYSQL_USER: ${RDB_USERNAME:-deardays}
      MYSQL_PASSWORD: ${RDB_PASSWORD:?...}
    volumes:
      - db-data:/var/lib/mysql          # DB 파일은 볼륨에 → 컨테이너를 지워도 남음
    healthcheck: mysqladmin ping        # 응답해야 healthy

  api:                                  # Node.js API 서버 (backend/Dockerfile 로 빌드)
    build: ./backend
    depends_on:
      db: { condition: service_healthy }   # DB가 준비된 뒤에 시작
    environment:
      DB_HOST: db                       # 'db' = 위 서비스 이름 (Docker 내부 주소)
      DB_NAME, DB_USER, DB_PASSWORD     # .env 의 RDB_* 값. 시작할 때 DATABASE_URL 로 합침
      JWT_SECRET, JWT_EXPIRES_IN(7d), CLIENT_ORIGIN(=PUBLIC_URL), EXTRA_ORIGINS,
      AUTH_RATE_LIMIT, TRUST_PROXY, ADMIN_PASSWORD, MAX_IMAGE_SIZE_MB(5), TZ(Asia/Seoul)
    volumes:
      - uploads:/data/uploads           # 올린 사진
    healthcheck: GET /api/health        # 서버와 DB 연결이 정상이어야 healthy

  web:                                  # nginx (frontend/Dockerfile 로 빌드)
    build: ./frontend
    depends_on:
      api: { condition: service_healthy }
    ports:
      - "${WEB_PORT:-80}:80"            # 바깥으로 열리는 유일한 포트

volumes:
  db-data:                              # 일기·계정 등 모든 DB 데이터
  uploads:                              # 일기 사진, 프로필 사진
```

- `TZ: Asia/Seoul`: 타임캡슐 편지의 "여는 날"과 "오늘의 주제"를 한국 시간으로 판단합니다.
- `MAX_IMAGE_SIZE_MB: 5`: 사진 한 장 최대 크기입니다. 늘리면 `frontend/nginx.conf` 의 `client_max_body_size`(지금 40m)도 같이 늘리세요.

### Dockerfile 자세히 보기

**`backend/Dockerfile` (api)**

1. `node:24-bookworm-slim` 위에 Prisma가 쓰는 OpenSSL을 설치합니다.
2. `package.json`, `package-lock.json`, `prisma/` 를 먼저 복사해 `npm ci` 를 실행합니다. 코드만 바뀌면 이 단계는 캐시를 써서 빌드가 빠릅니다. (사진 처리 라이브러리 sharp도 이때 Linux용으로 설치됩니다)
3. `src/`, `scripts/` 를 복사하고, 사진 폴더 `/data/uploads` 를 만들어 `node` 사용자에게 줍니다. 서버는 root가 아닌 `node` 사용자로 돌아갑니다.
4. 시작할 때 `scripts/docker-start.js` 가 순서대로 실행합니다.
   - `DB_*` 값으로 DB 접속 주소를 만듭니다. 비밀번호의 특수문자는 자동으로 인코딩합니다.
   - `prisma migrate deploy` 로 테이블을 최신 상태로 맞춥니다.
   - API 서버를 켭니다.

**`frontend/Dockerfile` (web)**

1. **빌드 단계**: Node 이미지에서 `npm ci` → `npm run build` 로 화면 파일(`dist/`)을 만듭니다.
2. **실행 단계**: 가벼운 `nginx:1.27-alpine` 에 `dist/` 와 `nginx.conf` 만 복사합니다. Node.js는 최종 이미지에 들어가지 않습니다.

**`frontend/nginx.conf`**

- `/api/`, `/uploads/` 요청은 `api` 컨테이너로 넘깁니다. 화면과 API가 같은 주소라 CORS 설정이 필요 없습니다.
- `/assets/` (이름에 해시가 붙은 빌드 파일)는 1년 동안 캐시하고, `index.html` 은 매번 새로 확인합니다. 그래서 업데이트하면 바로 새 화면이 보입니다.
- 그 밖의 주소는 `index.html` 로 보내 새로 고침해도 404가 나지 않습니다.
- gzip 압축, 요청 크기 제한 40MB.

### 운영 명령어 모음

모두 `docker-compose.yml` 이 있는 `deardays` 폴더에서 실행합니다.

| 하고 싶은 일 | 명령어 |
| --- | --- |
| 상태 보기 | `docker compose ps` |
| 로그 보기 (실시간, `Ctrl + C` 로 빠져나오기) | `docker compose logs -f api` |
| 최근 로그 100줄 | `docker compose logs --tail=100` |
| 다시 시작 | `docker compose restart` |
| 코드 업데이트 후 다시 배포 | `git pull` 후 `docker compose up -d --build` |
| 끄기 (데이터 유지) | `docker compose down` |
| 다시 켜기 | `docker compose up -d` |
| MySQL 콘솔 열기 | `docker compose exec db sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'` |
| 디스크 사용량 | `docker system df` |
| 체험 데이터 넣기 (테스트 서버에서만) | `docker compose exec api npm run db:seed` |
| ⚠️ 데이터까지 모두 삭제 (되돌릴 수 없음) | `docker compose down -v` |

### 배포 문제 해결

| 증상 | 원인과 해결 |
| --- | --- |
| `required variable RDB_PASSWORD is missing` 처럼 `.env 에 ... 를 설정해 주세요` | `.env` 가 없거나 값이 비었습니다. 3단계를 다시 확인하세요. `.env` 는 `docker-compose.yml` 과 같은 폴더에 있어야 합니다 |
| `db` 가 계속 `Restarting`, 로그(`docker compose logs db`)에 `MYSQL_USER="root" ... cannot be used for the root user` | `.env` 의 `RDB_USERNAME` 이 `root` 입니다. `deardays` 처럼 다른 이름으로 바꾸고 `docker compose up -d`. (root 비밀번호는 `RDB_ROOT_PASSWORD` 로 따로 정합니다) |
| `Bind for 0.0.0.0:80 failed: port is already allocated` | 80번 포트를 다른 프로그램이 쓰고 있습니다. `.env` 의 `WEB_PORT=8080` 으로 바꾸고 `docker compose up -d` |
| `api` 가 계속 재시작되고 로그에 `P1000: Authentication failed` | 첫 실행 뒤 `.env` 의 `RDB_PASSWORD` 를 바꿨습니다. 원래 값으로 되돌리거나, 아래 "DB 비밀번호 바꾸기"를 따라 하세요 |
| `api` 로그에 `JWT_SECRET을 32자 이상` | `JWT_SECRET` 이 너무 짧습니다. `openssl rand -hex 48` 로 다시 만드세요 |
| 사진을 올리면 "413 Request Entity Too Large" | 앞단 프록시(학교 nginx 등)의 업로드 크기 제한입니다. `client_max_body_size 40m;` 을 추가하세요 |
| 사진 올리기가 "권한" 오류로 실패 | 사진 복원 후 파일 주인이 바뀌었습니다. `docker compose exec -u root api chown -R node:node /data/uploads` |
| 브라우저에서 접속이 안 됨 (서버 안 `curl` 은 됨) | 방화벽 또는 학교망 포트 차단입니다. 6단계의 `ufw` 명령과 서버 담당자 문의 |
| 빌드 중 `npm ci` 에서 네트워크 오류 | 서버가 인터넷(npm, Docker Hub)에 닿지 않습니다. 프록시 설정이 필요한지 담당자에게 문의 |
| 편지가 하루 늦게/일찍 도착 | `TZ: Asia/Seoul` 이 빠졌는지 `docker-compose.yml` 을 확인 |

<details>
<summary>DB 비밀번호 바꾸기 (첫 실행 이후)</summary>

MySQL 안의 비밀번호를 먼저 바꾸고, 그다음 `.env` 를 바꿉니다. `새비밀번호` 자리에 영문·숫자로 된 새 값을 넣으세요.

```bash
docker compose exec db sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "ALTER USER \"$MYSQL_USER\"@\"%\" IDENTIFIED BY \"새비밀번호\";"'
```

`.env` 의 `RDB_PASSWORD` 를 같은 값으로 바꾼 뒤 다시 실행합니다.

```bash
docker compose up -d
```

데이터가 필요 없는 테스트 서버라면 `docker compose down -v` 로 모두 지우고 새 값으로 처음부터 시작해도 됩니다.

</details>

<details>
<summary>Docker 없이 직접 배포할 때</summary>

서버에 Docker가 있다면 위의 방법이 가장 간단합니다. Docker를 쓸 수 없을 때만 참고하세요.

- `npm run build:web` 으로 만든 `frontend/dist` 를 정적 호스팅(nginx 등)에 올립니다. API를 다른 주소에 둘 때는 빌드 전에 `frontend/.env` 의 `VITE_API_URL` 에 API 주소를 적습니다.
- API 서버는 `backend` 폴더에서 `npm start` 로 실행하고, `backend/.env` 에 `NODE_ENV=production`, 실제 `CLIENT_ORIGIN`(화면 주소), 32자 이상 `JWT_SECRET` 을 설정합니다. 꺼져도 다시 켜지도록 pm2나 systemd로 실행하세요.
- 서버에서는 `npm run db:migrate` 로 테이블을 만들고, 시드는 넣지 않습니다.
- `backend/uploads` 폴더는 사용자가 올린 사진이 쌓이는 곳이므로 백업 대상에 넣으세요.

</details>

---

## 화면만 Vercel 에 올리기 (선택)

학교 서버에는 지금처럼 Docker 로 전부(화면 + API + DB) 띄워 두고, **화면만 Vercel 에도** 올리는 방법입니다.
`git push` 할 때마다 Vercel 이 화면을 알아서 새로 배포해 주고, 화면이 빨리 뜹니다.

```
 브라우저 ── https://deardays.vercel.app  (화면: Vercel)
    │
    └──── https://학교서버주소/api, /uploads  (API·사진·DB: 학교 서버 Docker)
```

> ⚠️ **학교 서버가 `https://` 로 열려야 합니다.** Vercel 화면은 항상 https 라서, `http://` 서버는 브라우저가 막습니다(Mixed Content).
> 아직이면 [9단계. HTTPS 붙이기](#9단계-선택-https-붙이기)를 먼저 하세요.

### 1. Vercel 에 프로젝트 만들기

1. [vercel.com](https://vercel.com) 에 GitHub 계정으로 가입·로그인합니다.
2. **Add New... → Project** → GitHub 저장소 `deardays` 를 **Import** 합니다.
3. 설정 화면에서 이렇게 고릅니다.

| 항목 | 값 |
| --- | --- |
| Root Directory | `frontend` (Edit 을 눌러 고르기) |
| Framework Preset | Vite (`frontend/vercel.json` 덕분에 자동으로 맞춰짐) |
| Build Command / Output Directory | 그대로 (`npm run build` / `dist`) |
| Environment Variables | 이름 `VITE_API_URL`, 값 `https://학교서버주소` |

`VITE_API_URL` 은 학교 서버 주소만 적습니다. **끝에 `/` 나 `/api` 를 붙이지 마세요.** (예: `https://diary.school.ac.kr`)

4. **Deploy** 를 누르고 1~2분 기다리면 `https://deardays-xxxx.vercel.app` 같은 주소가 나옵니다. 이 주소를 복사해 둡니다.

### 2. 학교 서버가 Vercel 화면을 받아 주게 하기

API 는 정해 둔 주소에서 온 요청만 받습니다. 학교 서버의 `.env` 에 Vercel 주소를 추가합니다.

```env
EXTRA_ORIGINS=https://deardays-xxxx.vercel.app
```

```bash
docker compose up -d
```

`up -d` 는 바뀐 설정을 알아채고 api 만 다시 만듭니다. Vercel 에 내 도메인을 연결했다면 그 주소도 쉼표로 이어 적습니다.

### 3. 확인

Vercel 주소로 접속해 로그인해 보세요. 일기와 사진이 보이면 끝입니다.

| 증상 (브라우저 F12 → Console) | 해결 |
| --- | --- |
| `blocked by CORS policy` | 학교 서버 `.env` 의 `EXTRA_ORIGINS` 가 Vercel 주소와 똑같은지(https, 끝에 `/` 없이) 보고 `docker compose up -d` |
| `Mixed Content` | `VITE_API_URL` 이 `http://` 입니다. `https://` 로 고치고 Vercel 에서 **Redeploy** |
| 로그인 버튼을 눌러도 "서버에 연결할 수 없어요" | `VITE_API_URL` 오타, 또는 학교 서버가 꺼짐. `https://학교서버주소/api/health` 가 열리는지 확인 |
| 환경변수를 바꿨는데 그대로 | `VITE_API_URL` 은 빌드할 때 들어갑니다. Vercel → Deployments → 최신 배포 → **Redeploy** |

### 그다음부터

- **화면만 바뀐 경우**: `git push` 하면 Vercel 이 알아서 다시 배포합니다.
- **API·DB 가 바뀐 경우**: 지금처럼 학교 서버에서 `git pull` → `docker compose up -d --build`.
- 학교 서버의 화면(`https://학교서버주소`)도 그대로 남아 있어서 예비로 쓸 수 있고, **데스크톱 앱은 학교 서버 주소를 그대로** 쓰면 됩니다.
- Vercel 이 브랜치마다 만드는 미리보기 주소는 `EXTRA_ORIGINS` 에 없어서 로그인이 안 됩니다. 정식 주소로 접속하세요.
- 사진 업로드는 Vercel 을 거치지 않고 학교 서버로 바로 가므로 Vercel 의 요청 크기 제한과 상관없습니다.

## 데스크톱 앱 (Windows)

### 검토 결과

데스크톱 앱으로 만들 수 있고, 만들어 두었습니다(`desktop/` 폴더). 방식은 이렇습니다.

- [Electron](https://www.electronjs.org/)으로 만든 **창 프로그램이 배포한 DearDays 서버 주소를 엽니다.** 일기 데이터는 서버에 있어서 친구와 그대로 공유됩니다.
- 화면은 서버에서 받아 오므로 **서버만 업데이트하면 앱도 자동으로 최신**입니다. 앱을 다시 설치할 일이 거의 없습니다.
- 웹에는 없는 기능이 더해집니다.
  - 창이 뒤에 있을 때 친구의 새 일기·댓글이 오면 **윈도우 알림**이 뜨고 작업 표시줄 아이콘이 깜빡입니다.
  - 안 읽은 새 소식이 있으면 작업 표시줄 아이콘에 빨간 점이 붙습니다.
  - 바탕 화면·시작 메뉴 바로 가기, 한국어 메뉴(파일 / 보기 / 도움말), 확대·축소, 전체 화면을 씁니다.
  - 앱을 두 번 실행하면 이미 열린 창으로 돌아갑니다.
- 앱 창은 설정한 서버 주소만 엽니다. 다른 사이트 링크는 기본 브라우저로 열고, 카메라·위치 같은 권한은 모두 거부합니다(알림만 허용).

> 오프라인(인터넷 없이) 일기 쓰기는 지원하지 않습니다. 서버에 닿지 않으면 "서버에 연결할 수 없어요" 화면과 **다시 시도** 버튼이 나옵니다.

### 설치 파일 만들기

Windows 컴퓨터에서 Node.js 20 이상이 있으면 됩니다. 처음에는 Electron(약 100MB)을 내려받느라 몇 분 걸립니다.

```bash
cd desktop
```

```bash
npm install
```

```bash
npm run dist
```

`desktop/dist/` 에 두 파일이 생깁니다.

| 파일 | 쓰는 법 |
| --- | --- |
| `DearDays-Setup-1.0.0.exe` | 설치 프로그램. 설치 폴더를 고를 수 있고, 바탕 화면·시작 메뉴 바로 가기를 만듭니다. 제어판에서 제거할 수 있습니다 |
| `DearDays-1.0.0-portable.exe` | 설치 없이 바로 실행하는 휴대용 파일. USB에 넣어 다녀도 됩니다 |

친구에게는 둘 중 하나를 보내 주면 됩니다.

### 처음 실행하기

1. 처음 실행하면 **서버 주소 입력** 창이 나옵니다. 배포한 주소(예: `http://10.20.30.40:8080`)를 입력하고 **연결 확인**을 누릅니다.
2. "연결됐어요!"가 나오면 **연결하기**를 누릅니다. 주소가 저장되어 다음부터는 바로 로그인 화면이 열립니다.
3. 서버 주소를 바꾸려면 시작 메뉴의 **서버 주소 바꾸기...** 또는 창 메뉴의 **파일 → 서버 주소 바꾸기...** 를 누르세요. (메뉴 줄은 `Alt` 키를 누르면 보입니다)

> **"Windows의 PC 보호" 파란 창이 뜨면**: 코드 서명 인증서(유료)로 서명하지 않은 앱이라 처음 실행할 때 나오는 경고입니다. **추가 정보 → 실행**을 누르면 됩니다.

### 서버 주소를 미리 넣어 두기

친구가 주소를 입력하지 않아도 되게, 빌드하기 전에 `desktop/package.json` 의 `defaultServer` 에 서버 주소를 적어 두세요.

```json
"deardays": {
  "defaultServer": "http://10.20.30.40:8080"
}
```

그다음 `npm run dist` 로 만든 설치 파일은 첫 실행부터 그 서버를 엽니다.

### 그 밖의 명령

| 명령어 (`desktop` 폴더에서) | 하는 일 |
| --- | --- |
| `npm start` | 빌드 없이 바로 실행 (개발용) |
| `npm run dist` | Windows 설치 파일 + 휴대용 exe 만들기 |
| `npm run dist:mac` | macOS용 `.dmg` (Mac에서만 빌드 가능) |
| `npm run dist:linux` | Linux용 `.AppImage` (Linux에서 빌드) |
| `npm run icons` | 앱·웹 아이콘 PNG 다시 만들기 |

- 앱 설정(서버 주소)은 `%APPDATA%\DearDays\config.json` 에 저장됩니다. 로그인 정보도 이 폴더에 있습니다.
- 개발 중에는 `DEARDAYS_SERVER=http://localhost:5173 npm start` 처럼 이번 실행에만 다른 서버를 열 수 있습니다(저장하지 않음).

---

## 휴대폰에서 쓰기

### 반응형 화면

화면 너비에 맞춰 배치가 바뀝니다. 320px(작은 휴대폰)부터 큰 모니터까지 가로 스크롤 없이 보이도록 11개 화면을 확인했습니다.

| 너비 | 바뀌는 것 |
| --- | --- |
| 휴대폰 (~1023px) | 모든 창을 한 줄로 쌓음(홈: 한마디 → 주제 → 최근 일기 → 달력). 작업 표시줄 버튼은 아이콘만. 입력칸 글자를 16px로 키워 아이폰에서 확대되지 않게 함. 찾기 화면의 날짜 칸을 위아래로 |
| 컴퓨터 (1024px~) | 작업 표시줄 버튼에 글자 표시. 1280px 이상이면 작업 표시줄에 공간 이름도 표시. 홈은 왼쪽 오늘의 한마디·오늘의 주제 + 오른쪽 달력(두 칸의 아래 끝을 맞춤), 그 아래 최근 일기를 가로로 길게 |
| 넓은 모니터 (1600px~) | 본문 양옆에 작은 창: 왼쪽 **함께한 날**(공간을 만든 날부터 며칠째, 다음 100일·주년까지 D-day)과 **시계**, 오른쪽 **다가오는 날**(기념일 3개), **이번 주 우리**(일~토 누가 썼는지, 누르면 달력)와 **메모장**(나만 보는 메모, 이 기기에만 저장) |

- 터치 화면에서는 버튼과 체크박스를 손가락으로 누르기 좋게 크게 만듭니다.
- 작업 표시줄은 화면 맨 위에 있고, 시작 메뉴와 새 소식 창은 그 아래로 열립니다. 아이폰의 노치·홈 바 영역(safe area)을 피해서 띄웁니다.

### 홈 화면에 추가 (앱처럼 쓰기)

- **아이폰 (Safari)**: 공유 버튼 → **홈 화면에 추가**
- **안드로이드 (Chrome)**: 메뉴(⋮) → **홈 화면에 추가** 또는 **앱 설치**

DearDays 아이콘이 생기고, 누르면 주소창 없이 전체 화면으로 열립니다. 안드로이드에서 "앱 설치"로 제대로 설치되려면 서버가 **HTTPS** 여야 합니다([9단계](#9단계-선택-https-붙이기)).


### 안드로이드 앱 (APK)

안드로이드는 홈 화면에 추가하는 대신 **진짜 앱(APK)으로 설치**할 수 있습니다(`android/` 폴더). 웹 화면(React)을 통째로 앱 안에 넣은 앱이라(Capacitor), 인터넷 창이 아니라 앱으로 열리고, 일기·로그인 같은 데이터만 서버(`https://deardays.https.gsmsv.site`)의 API 와 주고받습니다.

- 패키지 이름 `site.gsmsv.deardays`, 안드로이드 7.0(API 24) 이상
- 폰의 **뒤로** 버튼: 작은 창·시작 메뉴가 떠 있으면 그것부터 닫고, 앞 화면이 있으면 앞 화면으로, 첫 화면이면 앱을 뒤로 보냅니다(다시 열면 보던 화면 그대로).
- 로그인은 앱을 껐다 켜도 유지됩니다(로그인 상태 유지를 골랐을 때).
- **푸시 알림은 아직 앱에서 안 됩니다.** 웹 푸시는 브라우저 기능이라 앱 안에서는 받을 수 없어요. 앱을 열면 위쪽 종(새 소식)에서 친구의 새 일기·댓글을 볼 수 있습니다. (앱 알림을 켜려면 Firebase(FCM) 프로젝트를 만들어 서버와 앱에 연결해야 합니다)
- 아이폰은 APK 를 설치할 수 없어서, 아이폰은 [홈 화면에 추가](#홈-화면에-추가-앱처럼-쓰기)를 씁니다.

#### 설치하기 (친구들)

1. `DearDays-x.y.z.apk` 파일을 휴대폰으로 받습니다(GitHub Releases, 카톡 파일 등).
2. 파일을 열면 "출처를 알 수 없는 앱" 허용을 묻습니다. 이번만 허용하고 **설치**를 누릅니다.
3. 예전 버전(1.0.0, 웹 껍데기 앱)을 깔아 둔 폰에는 지우지 않고 그 위에 업데이트로 깔립니다(같은 서명 키).

#### 서버에서 해 둘 것 (한 번)

앱 안의 화면은 `https://localhost` 라는 출처에서 열리기 때문에, 서버가 이 출처의 요청을 받아 줘야 합니다. `backend/src/config/env.js` 가 앱 출처(`https://localhost`, 아이폰용 `capacitor://localhost`)를 항상 허용하므로 **서버를 최신 코드로 다시 배포하기만** 하면 됩니다. 배포 전에는 앱에서 로그인이 되지 않습니다. (로그인은 쿠키가 아니라 토큰이라, 이 출처를 열어도 다른 사이트가 남의 로그인을 쓸 수는 없습니다)

#### 직접 빌드하기

준비물: Node 22 이상, JDK 21, Android SDK(안드로이드 스튜디오를 깔면 같이 생김).

```bash
cd frontend
npm run app:sync
```

화면을 앱용으로 빌드하고(`frontend/.env.app` 의 서버 주소를 씀, 결과는 `frontend/dist-app`), `android/` 프로젝트에 복사합니다. 그다음:

```bash
cd android
./gradlew assembleRelease
```

`android/app/build/outputs/apk/release/app-release.apk` 가 생깁니다. 처음 빌드할 때 Gradle 과 빌드 도구를 내려받느라 몇 분 걸립니다. `JAVA_HOME`·`ANDROID_HOME` 이 안 잡혀 있으면 앞에 붙여 실행하세요(예: `JAVA_HOME=~/.jdks/ms-21.0.12.1 ANDROID_HOME=$LOCALAPPDATA/Android/Sdk ./gradlew assembleRelease`).

- 서버 주소를 바꾸려면 `frontend/.env.app` 의 `VITE_API_URL` 을 고치고 다시 빌드합니다.
- 앱 아이콘은 `frontend/public/icon-512.png` 로 만듭니다: `node android/scripts/make-icons.cjs`
- 내 컴퓨터의 테스트 서버로 시험하려면: `VITE_API_URL=http://localhost:4001 npx vite build --mode app --outDir dist-app` → `npx cap sync android` → `./gradlew assembleDebug`. 디버그 빌드만 `localhost`·`10.0.2.2` 에 http 로 붙을 수 있습니다(`android/app/src/debug`). 에뮬레이터에서는 `adb reverse tcp:4001 tcp:4001` 로 내 컴퓨터의 4001 번을 연결합니다.

#### 서명 키 (중요)

- APK 는 `deardays` 폴더 **바깥**의 `deardays-android-signing/` 폴더에 있는 키로 서명합니다. 그 안의 `deardays-release.jks`(키)와 `keystore.properties`(비밀번호)는 **저장소에 올리지 않습니다**(`android/.gitignore`).
- 다른 곳에 두었다면 `./gradlew assembleRelease -Pdeardays.signing=keystore.properties경로` 로 알려 줍니다. 키가 없으면 서명 안 된 APK 가 나와 설치할 수 없습니다.
- **이 키를 잃어버리면 같은 앱으로 업데이트를 낼 수 없습니다.** (새 키로 만들면 친구들이 지우고 다시 깔아야 함) USB나 클라우드에 따로 백업해 두세요.

#### 새 버전 내기

화면이 앱 안에 들어 있어서, **화면을 고쳤으면 APK 도 새로 내야** 앱에 반영됩니다. (서버만 고친 거라면 서버만 배포하면 됩니다)

1. `android/app/build.gradle` 의 `versionCode` 를 1 올리고 `versionName` 을 바꿉니다(예: 3, "1.2.0").
2. `npm run app:sync`(frontend) → `./gradlew assembleRelease`(android) 로 다시 빌드합니다. 같은 키로 서명되므로 친구들은 새 APK 를 그냥 설치하면 업데이트됩니다.

---

## 관리자: 주제 편집과 문의함

관리자는 **서버에 정해 둔 관리자 비밀번호를 앱에 입력한 계정**입니다. 따로 관리자 계정을 만들 필요는 없습니다. 관리자는 **관리자 화면**(`/admin`)에서 두 가지를 합니다.

- **오늘의 주제**: 날짜마다 하나씩 넣어 두면 그날 모든 공간에 글감(하루 하나 글쓰기)으로 열립니다.
- **문의함**: 사람들이 내 정보 → 문의하기로 보낸 글을 읽고 답합니다.

### 1. 관리자 비밀번호 정하기

비밀번호는 서버의 환경변수 `ADMIN_PASSWORD` 에 넣습니다. **8자 이상**이어야 하고, 비어 있거나 짧으면 관리자 기능이 꺼집니다. 무작위 값을 쓰면 안전합니다.

```bash
openssl rand -hex 12
```

**Docker로 배포한 서버**: `docker-compose.yml` 이 있는 폴더의 `.env` 에 넣고 api 컨테이너를 다시 만듭니다.

```env
ADMIN_PASSWORD=여기에_정한_비밀번호
```

```bash
docker compose up -d
```

`up -d` 는 바뀐 환경변수를 알아채고 api 만 다시 만듭니다. DB와 사진은 그대로입니다.

**내 컴퓨터(개발용)**: `backend/.env` 에 같은 줄을 넣고 API 서버를 다시 켭니다(`npm run dev` 를 껐다 켜기).

### 2. 앱에서 관리자 되기

1. 로그인한 뒤 **내 정보** 창 아래 상태 표시줄의 **관리자...** 를 누릅니다. (주소창에 `/admin` 을 쳐도 됩니다)
2. **관리자 비밀번호 넣기...** 를 누르고, 1에서 정한 비밀번호를 넣고 **확인**을 누릅니다.

맞으면 그 계정이 관리자가 되고 **관리자 - 제어판** 창에 **오늘의 주제** · **문의함** 탭이 나타납니다. 그다음부터는 시작 메뉴에 **관리자** 가 생겨 바로 열 수 있어요. 한 번 관리자가 되면 로그아웃해도 그대로이고, 제어판 아래의 **관리자 그만하기** 로 끌 수 있습니다. 틀린 비밀번호는 로그인처럼 15분에 정해진 횟수까지만 시도할 수 있습니다.

### 3. 주제 넣기·고치기·지우기 (오늘의 주제 탭)

- **여러 개 한꺼번에**: 입력칸에 한 줄에 하나씩 쓰고 **N개 넣기** 를 누르면 오늘부터 주제가 비어 있는 날짜에 차례로 들어갑니다. 빈 줄은 무시합니다. (한 번에 100개, 주제 하나는 200자까지)
- **날짜를 정해서 하나**: 한 줄만 쓰고 날짜를 고르면 그날 주제가 됩니다. 날짜를 비우면 다음 빈 날짜로 들어갑니다. 이미 주제가 있는 날짜는 고를 수 없습니다.
- **오늘과 앞으로 / 지난 주제** 탭에서 각 주제의 연필 버튼으로 내용·날짜를 고치고, 휴지통 버튼으로 지웁니다. 주제를 지워도 그 주제로 쓴 일기는 남고 주제 표시만 사라집니다.

> 아직 오지 않은 날의 주제는 관리자에게만 보입니다. 다른 사람은 그날이 되어야 볼 수 있고, 그 주제로 미리 쓸 수도 없습니다.
>
> 관리자가 넣지 않은 날은 서버에 들어 있는 글감 목록(`backend/src/config/topicPrompts.js`)에서 하나가 자동으로 열립니다(관리 목록에 **자동** 표시). 그날 아직 아무도 그 주제로 안 썼다면 관리자가 같은 날짜로 주제를 넣어 바꿀 수 있어요. 글감 목록은 파일을 고쳐 더 넣거나 바꿀 수 있습니다.
>
### 4. 문의 읽고 답하기 (문의함 탭)

- **확인 전** 탭에 새 문의가 오래 기다린 것부터 쌓입니다. 탭 이름 옆 숫자가 확인 전 문의 수예요.
- 문의마다 보낸 사람 닉네임·이메일, 종류(오류 신고·기능 제안·계정·기타), 보낸 시각, 내용이 보입니다.
- 답변 칸에 쓰고 **답변 보내고 처리함** 을 누르면 보낸 사람의 내 정보 → 문의하기에 답변이 나타나고 '답변 완료'로 바뀝니다. 답이 필요 없으면 **답변 없이 처리함**.
- **처리함** 탭에서 답변을 고치거나 **다시 확인 전으로** 되돌릴 수 있고, 장난 문의는 **지우기** 로 지웁니다.
- 도배를 막으려고 한 사람이 '확인 전' 문의를 10개까지만 둘 수 있습니다. 탈퇴하면 그 사람의 문의도 함께 지워집니다.

> 관리자 비밀번호를 `.env` 에서 지우면 관리자 기능 전체가 꺼집니다. 이미 관리자가 된 계정도 주제를 관리하거나 문의함을 볼 수 없게 됩니다. 비밀번호를 바꾸면 새로 관리자가 되려는 사람만 새 비밀번호를 넣으면 되고, 이미 관리자인 계정은 그대로 관리자입니다. 관리자 계정을 모두 끄려면 각 계정에서 **관리자 그만하기**를 누르세요.

## 휴대폰 알림 켜기

친구가 일기·댓글·답글·도장을 남기면 휴대폰으로 알림이 오게 하는 방법입니다. 표준 웹 푸시(Web Push)를 써서 따로 앱 스토어에 올리지 않아도 됩니다.

> ⚠️ **`https://` 주소로 접속할 때만** 동작합니다. ([HTTPS 붙이기](#9단계-선택-https-붙이기)) 내 컴퓨터에서 `http://localhost` 로 볼 때는 PC 브라우저에서만 시험해 볼 수 있어요.

### 1. 서버에 알림 키 넣기 (한 번만)

알림 키(VAPID 키) 두 개를 만들어 `.env` 에 넣습니다.

```bash
docker compose run --rm --no-deps api npm run push:keys
```

나온 두 줄(`VAPID_PUBLIC_KEY=...`, `VAPID_PRIVATE_KEY=...`)을 `docker-compose.yml` 옆 `.env` 에 붙여 넣고 api 를 다시 만듭니다.

```bash
docker compose up -d
```

내 컴퓨터(개발용)라면 `backend` 폴더에서 `npm run push:keys` 를 실행하고 `backend/.env` 에 넣은 뒤 `npm run dev` 를 다시 켭니다.

> 한 번 정한 키는 바꾸지 마세요. 바꾸면 알림을 켠 기기들이 내 정보에서 다시 켜야 합니다. 개인 키(`VAPID_PRIVATE_KEY`)는 비밀번호처럼 남에게 보여 주지 마세요.

### 2. 기기에서 켜기 (기기마다)

| 기기 | 켜는 법 |
| --- | --- |
| 안드로이드 (크롬) | DearDays 주소로 접속 → 로그인 → **내 정보 → 휴대폰 알림 → 이 기기에서 알림 받기** → 알림 허용. "홈 화면에 추가"로 앱처럼 깔아 두면 더 편해요 |
| 아이폰·아이패드 (iOS 16.4 이상) | Safari 로 접속 → 공유 버튼 → **홈 화면에 추가** → 홈 화면의 DearDays 를 열고 로그인 → 내 정보 → 휴대폰 알림 → 알림 받기. (Safari 탭에서는 켤 수 없어요) |
| PC (크롬·엣지·사파리) | 내 정보 → 휴대폰 알림 → 알림 받기. 브라우저가 닫혀 있어도 PC 알림으로 와요 |

켠 뒤 **시험 알림 보내기**를 눌러 알림이 오는지 확인하세요. 알림을 눌렀을 때 그 일기가 열립니다.

| 증상 | 해결 |
| --- | --- |
| "서버에 알림 키가 아직 없어요" | 1단계를 하지 않았습니다 |
| "알림이 차단돼 있어요" | 주소창 왼쪽 자물쇠(휴대폰은 설정 → 알림)에서 이 사이트 알림을 허용한 뒤 새로 고침 |
| "https 주소로 접속했을 때만" | `http://` 로 접속했습니다. HTTPS 주소로 접속 |
| 아이폰에서 버튼이 없음 | Safari 탭이 아니라 **홈 화면에 추가한 앱**에서 열어야 합니다 |

- 알림은 기기마다 따로 켜고 끕니다. 로그아웃하면 그 기기의 알림은 자동으로 꺼져요 (같이 쓰는 컴퓨터에 남의 알림이 오지 않게).
- 데스크톱 앱(exe)은 원래부터 윈도우 알림을 띄우므로 여기서 켤 필요가 없습니다.

## 성능 최적화

| 항목 | 전 | 후 |
| --- | --- | --- |
| 첫 화면 JavaScript | 파일 하나 477KB | 라이브러리(React 261KB, Axios 59KB)와 앱 공통(51KB)으로 나누고, 화면별 코드(1~13KB)는 그 화면을 열 때 불러옴 |
| CSS | 162KB | 98KB (안 쓰는 글꼴 굵기 제거) |
| 일기 사진 | 올린 그대로 (예: 휴대폰 사진 4000×3000) | 긴 변 1600px 이하 WebP로 변환. 작은 사진은 키우지 않음 |
| 프로필 사진 | 올린 그대로 | 320×320 WebP, 사진에서 가장 눈에 띄는 부분을 중심으로 자르기 |
| 데스크톱 앱 설치 파일 | 121MB | 113MB (한국어·영어 외 언어 파일 제외) |

- **사진 위치 정보 제거**: 휴대폰 사진에 들어 있는 GPS·촬영 정보(EXIF)를 저장 전에 지웁니다. 사진이 옆으로 누워 있으면 방향도 바로잡습니다. GIF는 움직임을 지키기 위해 그대로 둡니다.
- **나중에 필요한 화면은 한가할 때 미리 받기**: 첫 화면이 뜬 뒤 브라우저가 쉬는 시간에 다른 화면 코드를 받아 두어, 메뉴를 눌렀을 때 기다림이 없습니다.
- **이미지 지연 로딩**: 화면 밖의 사진은 스크롤해서 보일 때 불러옵니다.
- **캐시**: 빌드 파일은 이름에 해시가 붙어 1년 캐시, `index.html` 은 매번 확인 → 다시 방문할 때 빠르고, 업데이트도 바로 반영됩니다.
- **gzip 압축**: nginx가 JS·CSS·JSON을 압축해서 보냅니다.

---

## 기술 스택

| 구분 | 사용한 것 |
| --- | --- |
| 화면 (프런트엔드) | React 19, Vite 7, React Router 7, Axios, Tailwind CSS 4, Lucide React |
| 서버 (백엔드) | Node.js 20 이상, Express 5, JWT, bcrypt, Multer, sharp(사진 변환), zod(입력 검증), helmet, express-rate-limit |
| 데이터베이스 | MySQL 8, Prisma ORM 6 |
| 데스크톱 앱 | Electron 45, electron-builder (NSIS 설치 파일, 휴대용 exe) |
| 배포 | Docker, Docker Compose, nginx |
| 글꼴 | [Galmuri11](https://github.com/quiple/galmuri) 하나 (굴림 비트맵을 닮은 픽셀 글꼴, OFL) |

## 폴더 구조

```
deardays/
├── package.json                 # 한 번에 설치·실행하는 편의 스크립트
├── docker-compose.yml           # 서버 배포: web + api + db
├── .env.example                 # Docker 배포용 환경변수 예시 → .env 로 복사
├── backend/
│   ├── Dockerfile               # api 이미지
│   ├── prisma/
│   │   ├── schema.prisma        # DB 모델 (User, DiaryRoom, DiaryRoomMember, Diary, DiaryImage,
│   │   │                        #          Comment, Like, Stamp, DailyTopic, Todo, Notification, Letter)
│   │   ├── migrations/          # 마이그레이션 SQL
│   │   └── seed.js              # 체험용 계정·일기·오늘의 주제
│   ├── scripts/
│   │   ├── create-env.js        # npm run setup:env
│   │   ├── migrate.js           # npm run dev 전에 DB 테이블을 최신으로 (predev)
│   │   ├── push-keys.js         # npm run push:keys: 휴대폰 알림 키 만들기
│   │   ├── docker-start.js      # Docker: 테이블 맞추고 서버 실행
│   │   └── smoke-test.js        # API 통합 테스트 (두 사용자 시나리오 전체)
│   ├── src/
│   │   ├── config/              # 환경변수, Prisma 클라이언트, 서비스 규칙 상수
│   │   ├── controllers/         # 요청 → 서비스 호출 → 응답
│   │   ├── middlewares/         # JWT 인증, 입력 검증, 업로드·사진 변환, 에러 처리, 요청 제한
│   │   ├── routes/              # REST 라우트
│   │   ├── services/            # 비즈니스 로직과 권한 검사
│   │   ├── utils/               # 날짜, 초대 코드, 직렬화, 파일 등
│   │   ├── validators/          # zod 입력 스키마
│   │   ├── app.js               # Express 앱 구성
│   │   └── server.js            # 서버 실행 + 시작 시 DB 연결 확인
│   ├── uploads/                 # 업로드 이미지 (diaries/, profiles/) - 개발용
│   └── .env.example             # 개발용 환경변수 예시
├── frontend/
│   ├── Dockerfile               # web 이미지 (빌드 → nginx)
│   ├── nginx.conf               # 화면 제공 + /api, /uploads 를 api 로 전달
│   ├── vercel.json              # 화면만 Vercel 에 올릴 때 설정 (새로 고침 404 방지, 캐시)
│   ├── public/                  # 파비콘, 앱 아이콘, manifest.webmanifest (홈 화면에 추가), sw.js (푸시 알림 받기)
│   ├── src/
│   │   ├── components/          # ui(창·버튼·대화상자 등), desktop(바탕 그림), diary(도장·낙서 포함), topic, room, todo, calendar, layout
│   │   ├── context/             # 로그인, 공유 공간, 새 소식, 화면 색, 토스트
│   │   ├── hooks/               # useFetch, useCalendarDays 등
│   │   ├── layouts/             # 바탕 화면(작업 표시줄) / 로그인 화면
│   │   ├── pages/               # 화면별 페이지 (lazyPages.js 로 필요할 때 불러옴)
│   │   ├── services/            # API 호출 (axios)
│   │   ├── utils/               # 날짜, 도트 아이콘, 저장소 등
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env.example
├── android/                     # 안드로이드 앱 (Capacitor: frontend 화면을 앱 안에 넣은 APK)
├── desktop/                     # Windows 데스크톱 앱 (Electron)
│   ├── src/
│   │   ├── main.js              # 창, 메뉴, 알림, 서버 연결 확인
│   │   ├── preload.js           # 웹 화면에 알림·배지 기능만 열어 줌
│   │   ├── config.js            # 서버 주소 저장
│   │   └── pages/               # 서버 주소 입력, 연결할 수 없음 화면
│   ├── scripts/make-icons.cjs   # 아이콘 PNG 생성
│   ├── build/                   # 앱 아이콘, 알림 배지
│   └── package.json             # 빌드 설정 (defaultServer 포함)
└── README.md
```

## API 목록

모든 응답은 JSON입니다. 실패하면 `{ "message": "사용자에게 보여 줄 문구", "code": "ERROR_CODE" }` 형태로 응답합니다.
`인증` 표시가 있는 API는 `Authorization: Bearer <토큰>` 헤더가 필요합니다.

| 메서드 | 경로 | 설명 | 인증 |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | 회원가입 `{ email, nickname, password }` → `{ token, user }` | |
| POST | `/api/auth/login` | 로그인 `{ email, password }` → `{ token, user }` | |
| GET | `/api/auth/me` | 내 계정 | 인증 |
| GET | `/api/auth/check-email?email=` | 이메일 사용 가능 여부 `{ available }` | |
| POST | `/api/rooms` | 공간 만들기 `{ name }` (초대 코드 자동 발급) | 인증 |
| POST | `/api/rooms/join` | 초대 코드로 참여 `{ inviteCode }` | 인증 |
| GET | `/api/rooms` | 내가 참여한 공간 목록 | 인증 |
| GET | `/api/rooms/:roomId` | 공간 상세 (멤버만) | 인증 |
| PATCH | `/api/rooms/:roomId` | 공간 이름 변경 `{ name }` | 인증 |
| POST | `/api/rooms/:roomId/invite-code` | 초대 코드 재발급 | 인증 |
| DELETE | `/api/rooms/:roomId/members/me` | 공간 나가기 → `{ roomDeleted }` | 인증 |
| POST | `/api/diaries` | 일기 작성 (multipart: `roomId, title, content, diaryDate, mood?, weather?, topicId?, images[], doodle?`(PNG 낙서 1장)) | 인증 |
| GET | `/api/diaries?roomId=&sort=latest\|oldest&date=&month=&topicId=&page=&limit=` | 일기 목록 | 인증 |
| GET | `/api/diaries?roomId=&q=&authorId=&from=&to=` | 일기 찾기 (제목·내용 낱말, 쓴 사람, 날짜 범위. `%` `_` 도 글자 그대로) | 인증 |
| GET | `/api/diaries/calendar?roomId=&month=YYYY-MM` | 달력용 날짜별 일기 요약 | 인증 |
| GET | `/api/diaries/:id` | 일기 상세 | 인증 |
| PUT | `/api/diaries/:id` | 일기 수정 (multipart: `title, content, diaryDate, mood?, weather?, topicId?, removeImageIds(JSON 배열), images[], doodle?, removeDoodle?`), 작성자만 | 인증 |
| DELETE | `/api/diaries/:id` | 일기 삭제 (사진·낙서 파일도 삭제), 작성자만 | 인증 |
| POST | `/api/diaries/:id/comments` | 댓글 작성 `{ content, face?, parentId? }`. `face` 는 얼굴 이모티콘(happy·excited·calm·sad·angry·love·surprised·laugh), 글과 얼굴 중 하나는 있어야 함. `parentId` 를 주면 그 댓글에 답글 (답글의 답글은 맨 위 댓글 아래로) | 인증 |
| GET | `/api/diaries/:id/comments` | 댓글·답글 목록 (쓴 순서, 답글은 `parentId`, 지운 댓글은 `isDeleted`) | 인증 |
| PUT | `/api/comments/:id` | 댓글 수정 `{ content, face? }`, 작성자만 (`face` 를 빼면 그대로, `null` 이면 뺌) | 인증 |
| DELETE | `/api/comments/:id` | 댓글 삭제, 작성자만. 답글이 달린 댓글은 자리만 남김 | 인증 |
| POST | `/api/diaries/:id/likes` | 공감 (여러 번 눌러도 1회) → `{ liked, likeCount }` | 인증 |
| DELETE | `/api/diaries/:id/likes` | 공감 취소 | 인증 |
| POST | `/api/diaries/:id/stamps` | 도장 찍기 `{ kind }` (great·wow·lol·pat·same·best, 친구 일기만, 같은 도장은 1회) → `{ stamps }` | 인증 |
| DELETE | `/api/diaries/:id/stamps/:kind` | 내가 찍은 도장 떼기 | 인증 |
| GET | `/api/topics/today` | 오늘의 주제 `{ date, topic }` (없으면 `topic: null`) | 인증 |
| GET | `/api/topics?roomId=&page=&limit=` | 오늘까지 열린 주제 + 그 주제로 이 공간에서 쓴 글 | 인증 |
| GET | `/api/topics/:id` | 주제 하나 (아직 안 열린 주제는 관리자만) | 인증 |
| GET | `/api/rooms/:roomId/recap?year=` | 연말 결산 (비우면 올해, 올해는 오늘까지 센 값) | 인증 |
| GET | `/api/admin/status` | 관리자 기능 켜짐 여부와 내가 관리자인지 `{ enabled, isAdmin }` | 인증 |
| POST | `/api/admin/unlock` | 관리자 되기 `{ password }` (틀린 시도 제한) | 인증 |
| POST | `/api/admin/lock` | 관리자 그만하기 | 인증 |
| GET | `/api/admin/topics?scope=upcoming\|past` | 주제 목록 + 다음 빈 날짜 | 관리자 |
| POST | `/api/admin/topics` | 주제 넣기 `{ content, date? }` (날짜를 비우면 다음 빈 날짜) | 관리자 |
| POST | `/api/admin/topics/bulk` | 여러 주제 `{ contents: [] }` → 오늘부터 빈 날짜에 차례로 | 관리자 |
| PUT | `/api/admin/topics/:id` | 주제 고치기 `{ content, date }` | 관리자 |
| DELETE | `/api/admin/topics/:id` | 주제 지우기 (그 주제로 쓴 일기는 남음) | 관리자 |
| GET | `/api/admin/inquiries?status=open\|done\|all` | 문의함 (보낸 사람·이메일 포함) + 상태별 개수 `counts` | 관리자 |
| PUT | `/api/admin/inquiries/:id` | 답변·처리 `{ answer?, status: open\|done }` (answer 를 빼면 그대로, '' 이면 지움) | 관리자 |
| DELETE | `/api/admin/inquiries/:id` | 문의 지우기 | 관리자 |
| GET | `/api/inquiries` | 내가 보낸 문의와 답변 (최근 50개) | 인증 |
| POST | `/api/inquiries` | 문의 보내기 `{ category: bug\|idea\|account\|etc, content }` (5~2000자, 확인 전 10개까지) | 인증 |
| DELETE | `/api/inquiries/:id` | 내 문의 지우기 | 인증 |
| GET | `/api/rooms/:roomId/anniversaries` | 기념일 목록 (다가오는 날 순, `nextDate`·`dday`·`years`) | 인증 |
| POST | `/api/rooms/:roomId/anniversaries` | 기념일 넣기 `{ title, date, yearly }` | 인증 |
| PUT | `/api/anniversaries/:id` | 기념일 고치기, 넣은 사람만 | 인증 |
| DELETE | `/api/anniversaries/:id` | 기념일 지우기, 넣은 사람만 | 인증 |
| GET | `/api/push` | 휴대폰 알림이 켜진 서버인지, 공개키, 내 기기 수 `{ enabled, publicKey, devices }` | 인증 |
| POST | `/api/push/subscribe` | 이 기기 알림 받기 (브라우저 `PushSubscription` 그대로) | 인증 |
| DELETE | `/api/push/subscribe` | 이 기기 알림 끄기 `{ endpoint }` | 인증 |
| POST | `/api/push/test` | 내 기기들로 시험 알림 → `{ sent, failed }` | 인증 |
| GET | `/api/todos?roomId=` | 할 일 목록 + 개수 `{ items, counts: { total, done, open } }` (남은 일·기한 가까운 순) | 인증 |
| POST | `/api/todos` | 할 일 추가 `{ roomId, content, dueDate?, assigneeId? }` (맡은 사람 비우면 '함께') | 인증 |
| PUT | `/api/todos/:id` | 내용·기한·맡은 사람 수정, 추가한 사람만 | 인증 |
| PATCH | `/api/todos/:id/status` | 완료 표시/취소 `{ isDone }`, 공간 사람 누구나 가능 | 인증 |
| DELETE | `/api/todos/:id` | 할 일 삭제, 추가한 사람만 | 인증 |
| GET | `/api/notifications` | 새 소식 목록(최근 50개) + 안 읽은 개수 | 인증 |
| GET | `/api/notifications/unread-count` | 안 읽은 개수 (작업 표시줄이 주기적으로 확인) | 인증 |
| PATCH | `/api/notifications/:id/read` | 알림 하나 읽음 | 인증 |
| POST | `/api/notifications/read-all` | 모두 읽음 | 인증 |
| GET | `/api/letters?roomId=` | 받은 편지(봉인된 편지는 제목·내용 숨김) + 보낸 편지 | 인증 |
| POST | `/api/letters` | 편지 보내기 `{ roomId, recipientId, title, content, openAt }` (받는 사람: 공간 멤버 또는 나, 여는 날: 오늘~10년) | 인증 |
| GET | `/api/letters/:id` | 편지 열기. 받는 사람이 여는 날 전에 열면 403 `LETTER_SEALED`, 처음 열면 보낸 사람에게 알림 | 인증 |
| DELETE | `/api/letters/:id` | 보낸 사람은 열리기 전 '보내기 취소', 받는 사람은 열어 본 편지 삭제 | 인증 |
| GET | `/api/users/me` | 내 정보 + 통계 + 참여 공간 | 인증 |
| PUT | `/api/users/me` | 닉네임·자기소개 수정 | 인증 |
| PUT | `/api/users/me/password` | 비밀번호 바꾸기 `{ currentPassword, newPassword }` → 새 토큰. 예전 토큰은 모두 무효 | 인증 |
| DELETE | `/api/users/me` | 회원 탈퇴 `{ password }` | 인증 |
| POST | `/api/users/me/profile-image` | 프로필 사진 업로드 (multipart: `image`) | 인증 |
| DELETE | `/api/users/me/profile-image` | 기본 프로필로 | 인증 |
| GET | `/api/health` | 서버·DB 상태 | |

## 보안과 규칙

- 비밀번호는 bcrypt(12 rounds)로 저장합니다. 없는 이메일로 로그인할 때도 비교 시간을 맞춰 계정 존재 여부가 드러나지 않게 했습니다.
- 모든 보호 API는 JWT 미들웨어를 거치고, 토큰이 유효해도 계정이 사라졌으면 거부합니다.
- 공유 공간·일기·댓글·공감은 **그 공간의 멤버만** 접근할 수 있습니다. 멤버가 아니면 존재 여부도 숨기고 404로 응답합니다.
- 일기와 댓글의 수정·삭제는 작성자 본인만 할 수 있습니다(403).
- 답글은 한 단계만 있습니다. 답글이 달린 댓글을 지우면 내용과 작성자를 지우고 "삭제된 댓글이에요" 자리만 남겨, 친구들이 단 답글이 같이 사라지지 않게 합니다. 그 답글이 모두 지워지면 자리도 지웁니다. 지운 댓글은 댓글 수에서 빠집니다.
- 답글을 달면 답글 받은 사람에게는 '답글' 알림, 나머지 공간 사람들에게는 '댓글' 알림이 한 번씩만 갑니다.
- 할 일은 공간 사람 누구나 추가하고 체크할 수 있고, 내용 수정과 삭제는 추가한 사람만 할 수 있습니다. 맡을 사람은 그 공간의 멤버만 지정할 수 있습니다.
- 타임캡슐 편지는 서버가 여는 날을 판단합니다(서버 시간대 기준, Docker는 `Asia/Seoul`). 여는 날 전에는 받는 사람에게 제목·내용을 보내지 않습니다.
- 비밀번호를 바꾸면 그 전에 발급된 로그인 토큰은 모두 무효가 되고(다른 기기 로그아웃), 비밀번호를 확인하는 요청(변경·탈퇴)은 로그인처럼 틀린 시도 횟수를 제한합니다.
- 회원 탈퇴 시 내가 쓴 일기·사진 파일·댓글·공감·할 일·편지·알림을 지웁니다. 혼자 쓰던 공간은 공간째 지우고, 친구가 있는 공간은 친구에게 남기며 내가 맡았던 할 일은 '함께'로 바뀝니다.
- 일기 임시 저장은 이 기기의 브라우저에만 남고(사진 제외), 직접 로그아웃하면 지워집니다.
- 한 공간은 최대 6명입니다(`MAX_ROOM_MEMBERS`, 화면은 `frontend/src/utils/rooms.js`). 마지막 한 자리에 여러 사람이 동시에 참여해도 DB 행 잠금(`SELECT ... FOR UPDATE`)으로 한 명만 들어갑니다.
- 새 일기·댓글 알림은 공간의 나머지 모두에게, 공감·도장 알림은 그 일기를 쓴 사람에게 갑니다.
- 같은 일기에 같은 사람이 두 번 공감할 수 없도록 `(diaryId, userId)` 복합 unique 제약을 둡니다. 도장도 `(diaryId, userId, kind)` 로 같은 도장을 한 번만 찍을 수 있고, 내 일기에는 찍을 수 없습니다.
- 관리자 비밀번호는 서버 환경변수에만 있고, 입력값은 해시끼리 시간 일정한 비교(`timingSafeEqual`)로 확인합니다. 관리자 API는 매 요청마다 DB에서 관리자 여부를 다시 확인하고, 관리자 비밀번호가 설정되지 않은 서버에서는 모두 403입니다.
- 낙서는 PNG만 받아 무손실 WebP로 다시 저장합니다(도트가 뭉개지지 않게, 메타데이터 제거).
- 업로드는 확장자(.jpg .jpeg .png .gif .webp)와 MIME 타입을 함께 검사하고, 저장 후 파일 앞부분의 시그니처로 실제 이미지인지 한 번 더 확인합니다. 그다음 사진을 다시 그려(WebP 변환) 위치 정보 같은 메타데이터를 지웁니다. 파일 이름은 추측할 수 없는 UUID로 바꾸고, 실패한 요청에서 저장된 파일은 지웁니다.
- 로그인(실패 시도만)·회원가입·이메일 확인에 IP당 요청 제한을 둡니다.
- 비밀 값은 `.env` 로 관리하며 git에 올리지 않습니다.
- 데스크톱 앱은 웹 화면에 알림·배지 기능만 열어 주고(Node.js 접근 차단, sandbox), 서버 주소 저장 같은 기능은 앱 안의 설정 화면에서만 부를 수 있습니다.

### 공간 나가기 규칙

- 누가 나가도 공간과 일기는 남은 사람들에게 그대로 남고, 예전 초대 코드는 무효가 되며 새 코드가 발급됩니다. (나간 사람이 예전 코드로 다시 들어오지 못하게) 나간 사람이 맡았던 할 일은 '함께' 하는 일로 바뀝니다.
- 마지막 사람이 나가면 공간과 모든 일기·사진·댓글·할 일이 삭제됩니다. (화면에서 한 번 더 확인합니다.)

> 업로드한 사진은 `/uploads/...` 주소로 제공됩니다. 주소가 추측할 수 없는 UUID라 링크를 아는 사람만 열 수 있지만, 로그인 검사는 하지 않습니다. 더 엄격하게 하려면 서명된 URL 방식으로 바꾸는 것을 권합니다.

## 테스트

API 서버를 켠 상태(`npm run dev` 또는 `npm run dev:api`)에서 다른 터미널에 실행합니다.

```bash
npm run test:api
```

일곱 명의 사용자로 아래 내용을 확인합니다(관리자 비밀번호와 알림 키까지 주면 260개가 넘는 항목). (관리자 비밀번호나 알림 키 없이 돌리면 그 항목은 건너뛰고 '꺼져 있을 때'만 확인합니다) 테스트 계정은 실행할 때마다 새로 만들어집니다.

관리자 기능(주제 편집·문의함)까지 확인하려면 API 서버와 테스트에 같은 `ADMIN_PASSWORD` 를 줍니다. 없으면 '관리자 기능이 꺼져 있을 때'만 확인합니다. 테스트가 넣은 주제와 문의는 끝날 때 지웁니다.

```bash
ADMIN_PASSWORD=서버와_같은_값 npm run test:api
```

- 가입·로그인, 마이페이지.
- 공간 생성/참여: 6명 공간, 마지막 한 자리 동시 참여 경쟁, 정원 초과, 여럿에게 가는 알림.
- 사진 업로드: 가짜 이미지, 허용되지 않는 확장자, 장수 초과 검증, WebP 변환과 GIF 유지.
- 일기 CRUD와 권한, 정렬·날짜 필터·페이지네이션·달력, 기분·날씨.
- 공감 중복 방지, 댓글 권한, 댓글 얼굴 이모티콘(얼굴만 단 댓글, 없는 얼굴, 얼굴 바꾸기·빼기), 답글(답글의 답글, 알림, 지운 댓글 자리 남기기·정리).
- 할 일: 추가, 정렬, 체크, 수정·삭제 권한, 맡을 사람 검증.
- 문의: 보내기·검증, 남의 문의는 안 보임, 관리자 문의함·답변·처리·되돌리기, 확인 전 10개 제한.
- 검색: `%`·`_` 를 글자 그대로 찾기 포함.
- 새 소식 알림: 종류별 생성, 읽음 처리, 남의 알림 차단.
- 타임캡슐 편지: 봉인, 열기, 삭제 권한.
- 도장: 중복 방지, 내 일기 막기, 떼면 알림도 삭제.
- 낙서: PNG만 허용, 다시 그리면 이전 파일 삭제, 빼기, 일기 삭제 시 파일 정리.
- 오늘의 주제와 관리자: 비밀번호, 날짜 겹침, 한꺼번에 넣기, 공개 전 주제 숨김, 주제로 쓰기, 주제 삭제 후 일기 유지.
- 하루 하나 글쓰기: 주제가 없는 날의 자동 글감, 관리자 주제로 바꾸기.
- 기념일: 해마다 반복(2월 29일 포함)·한 번, D-day 계산과 순서, 권한, 날짜 검증.
- 휴대폰 알림: 키가 없을 때 막기, 구독·중복 구독·끄기, 시험 알림 전송(암호화까지 하고 없는 주소라 실패를 셈).
- 연말 결산: 일기·사람별·월별 합계, 일기 없는 해, 아직 오지 않은 해.
- 비밀번호 변경(예전 토큰 무효)과 회원 탈퇴(혼자/함께 쓰던 공간).
- 공간 나가기와 파일 정리.

## 디자인 노트

- 홈은 정보를 줄였습니다: 오늘의 한마디, 오늘의 주제, 달력, 최근 일기 네 창만 둡니다. 할 일과 함께하는 사람(우리 둘·우리 N명)은 작업 표시줄의 할 일·우리 일기장 화면에서 봅니다.
- 창은 열릴 때 살짝 커지며 나타나고, 닫힐 때 살짝 작아지며 사라집니다(움직임 줄이기 설정이면 바로).
- Windows 95 창을 따릅니다.
  - 빛은 왼쪽 위에서 비춥니다. 창·버튼은 왼쪽 위가 밝고, 오른쪽 아래가 그림자인 2px 입체 테두리예요.
  - 제목 표시줄은 그라데이션 없이 한 가지 색입니다. 밝은 제목 표시줄에서도 흰 글자가 또렷하도록 글자에 1픽셀 진한 그림자를 둡니다.
  - 작업 표시줄은 화면 맨 위에 둡니다.
- 색 구성표는 다섯 가지이고, 모두 같은 배치를 씁니다. 시작 메뉴의 **화면 설정...**(또는 내 정보)에서 바꾸고, 기기마다 기억합니다. 같은 창의 **화면 보호기** 탭에서 화면 보호기를 고릅니다.
  - 단색 바탕 세 가지
    - **벚꽃 (밝은 분홍)**: 벚꽃색 바탕(`#FFD7DB`), 하얀빛 창, 분홍 제목 표시줄. 포인트 색은 진한 마젠타(`#D6246E`).
    - **클래식 (회색)**: Windows 95 그대로. 청록 바탕, 회색 창, 남색 제목 표시줄.
    - **파란색**: 옅은 하늘색 바탕(`#E2EFF6`), 노란빛 창, 하늘색 제목 표시줄. 포인트 색은 코발트 블루(`#1F4FC4`).
  - 구름 바탕 두 가지 (창·버튼 색은 각각 벚꽃·파란색과 같고 바탕만 다름)
    - **벚꽃 하늘 (구름)**: 분홍 도트 하늘(띠 4개를 체크무늬로 섞음) + 흰 도트 구름 + 점점이 빛이 퍼지는 해 + 아래쪽 구름 바다.
    - **파란 하늘 (구름)**: 같은 구성을 파랗게(`#99C3E4` `#A8D0EF` `#C1E4F3` `#E3F1FB`).
  - 구름은 몇 초에 걸쳐 위아래로 몇 픽셀씩 은은하게 떠오르고, 몇 개는 아주 천천히 좌우로도 흐릅니다. 작고 느린 움직임이라 윈도우에서 '애니메이션 효과'를 꺼 둔(움직임 줄이기) 기기에서도 구름만은 움직입니다.
  - 바탕 그림을 보일지(하늘·해·구름·구름 바다)는 테마 블록의 `--show-*` 변수가 정합니다. 변수는 가장 가까운 테마를 따르므로, 화면 설정의 모니터 미리 보기 안에서도 고른 테마의 하늘이 그대로 보입니다.
- 글꼴은 하나만 씁니다: 굴림 비트맵을 닮은 픽셀 글꼴 Galmuri11. 메뉴, 버튼, 일기, 댓글 모두 같은 글꼴이에요.
- 일기 종이의 줄은 16px 글자의 기준선 바로 아래(줄 간격 32px)에 오도록 맞췄습니다. 글꼴이나 글자 크기를 바꾸면 `index.css` 의 `--rule-shift` 도 다시 맞춰야 합니다.
- 내 일기는 분홍 봉인 편지, 친구 일기는 민트 봉인 편지 아이콘으로 표시하고, 달력의 하트 색도 같은 규칙을 따릅니다.
- 아이콘과 바탕 그림은 문자 격자로 직접 그렸습니다(한 글자 = 한 픽셀). 아이콘은 `frontend/src/utils/pixelIcons.js` 의 16×16, 구름·해는 `frontend/src/utils/desktopArt.js`. 구름 색은 CSS 변수라서 테마를 따라 바뀝니다.
- 도장은 종이 위에 곱하기(multiply)로 겹치고, SVG 노이즈 필터로 잉크가 고르게 묻지 않은 느낌을 냅니다. 같은 도장은 늘 같은 각도·자리에 찍힙니다.
- 연말 결산의 막대는 가장 큰 값 하나만 진한 핑크로 강조하고 나머지는 회색으로 둡니다. 값은 강조한 막대에만 적고, 나머지는 마우스를 올리거나 키보드로 고르면 보입니다.
- 창의 접기(_)·최대화(□)·닫기(×) 버튼, 작업 표시줄, 시작 메뉴(↑↓ 키 이동), 달력(화살표 키 이동)이 모두 실제로 동작합니다.
