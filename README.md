# DearDays

친구와 둘이서 쓰는 교환 일기. 옛 윈도우 창 스타일을 파스텔로 다시 칠한 웹 앱입니다.

공유 공간을 만들고 초대 코드로 친구를 부르면, 두 사람만 볼 수 있는 일기장이 열립니다. 일기에는 사진을 붙일 수 있고, 서로의 일기에 하트 공감과 댓글을 남길 수 있습니다. 달력에서는 누가 어느 날 일기를 썼는지 하트로 보여 줍니다.

| 화면 | 하는 일 |
| --- | --- |
| 로그인 · 회원가입 | 이메일 가입, 이메일 중복 확인, 로그인 상태 유지 선택 |
| 홈 (바탕 화면) | 오늘 날짜와 오늘의 한마디, 나와 친구 프로필, 최근 일기 5편, 달력 미리보기 |
| 우리 일기장 | 두 사람 프로필, 초대 코드 복사·재발급, 일기 목록(최신순/과거순, 더 보기), 공간 이름 변경, 공간 나가기, 다른 공간 만들기/참여 |
| 일기 쓰기·수정 | 제목, 날짜, 기분(기쁨·설렘·평온·우울·화남)과 날씨 도트 아이콘, 줄 노트 본문, 사진 최대 6장(끌어다 놓기 지원), 업로드 진행률, 작성 중 이탈 확인, **자동 임시 저장**(다시 열면 "이어서 쓸까요?") |
| 일기 보기 | 작성자·날짜·기분·날씨, 본문, 사진 크게 보기, 하트 공감/취소, 댓글 작성·수정·삭제 (작성자 본인만) |
| 새 소식 | 작업 표시줄의 종에 안 읽은 개수, 새 소식이 오면 말풍선. 친구의 새 일기·댓글·공감, 맡긴 할 일, 친구 참여, 편지 보냄·도착·읽음. 누르면 해당 화면으로, 일기를 열면 그 알림은 자동으로 읽음 |
| 편지함 (타임캡슐) | 친구나 미래의 나에게 편지를 봉인해 보내기. 여는 날 전에는 받는 사람도 제목·내용을 볼 수 없고(D-day 표시), 그날이 되면 도착 알림. 친구가 열면 보낸 사람에게 알림. 열기 전 '보내기 취소' |
| 찾기 | 옛 윈도우 '찾기' 창. 제목·내용 낱말, 쓴 사람, 날짜 범위로 일기 찾기, 찾은 낱말 강조 |
| 할 일 | 두 사람이 함께 보는 할 일 목록. 기한(선택)과 맡을 사람(함께/나/친구), 누구든 체크, 누가 끝냈는지 기록, 기한 지남·오늘·내일 강조, 남은 일/끝낸 일/전체 탭, 진행 막대. 홈 화면에서 빠르게 추가·체크 |
| 달력 | 월 이동, 오늘 강조, 내가 쓴 날(분홍)과 친구가 쓴 날(라벤더). 기분을 골랐으면 그 표정의 얼굴로, 아니면 하트로 표시. 날짜별 일기, 그 날짜로 일기 쓰기 |
| 내 정보 | 프로필 사진 변경/기본 이미지로, 닉네임·자기소개 수정, 이메일 확인, 작성 통계, 참여 공간 목록, 화면 색, **비밀번호 바꾸기**(다른 기기는 로그아웃), **회원 탈퇴**, 로그아웃 |

---

## 실행하기

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

`deardays` 데이터베이스가 없으면 새로 만들고, 테이블 10개(users, diary_rooms, diary_room_members, diaries, diary_images, comments, likes, todos, notifications, letters)를 생성합니다.
`All migrations have been successfully applied.` 가 나오면 성공입니다.

### 6. (선택) 체험용 데이터 넣기

```bash
npm run db:seed
```

서로 연결된 계정 두 개와 일기 4편, 할 일 4개가 만들어집니다. 바로 둘러보고 싶을 때 쓰세요. 여러 번 실행해도 중복으로 만들어지지 않습니다.

| 이메일 | 비밀번호 | 닉네임 |
| --- | --- | --- |
| `haru@deardays.test` | `diary1234` | 하루 |
| `byeol@deardays.test` | `diary1234` | 별이 |

> 내 컴퓨터에서만 쓰는 체험용 계정입니다. 실제 서비스로 공개할 때는 시드를 넣지 마세요.

### 7. 실행

```bash
npm run dev
```

API 서버와 화면 서버가 한 터미널에서 같이 켜집니다. 아래 줄들이 보이면 준비 완료입니다.

```
[api] [DearDays] API 서버가 http://localhost:4000 에서 실행 중입니다.
[api] [DearDays] MySQL 연결 확인 완료
[web]   ➜  Local:   http://localhost:5173/
```

브라우저에서 **http://localhost:5173** 을 엽니다.

끌 때는 터미널에서 `Ctrl + C` 를 누르세요.

### 다음부터 실행할 때

설치와 설정은 한 번이면 됩니다. 다음부터는 `deardays` 폴더에서 이것만 실행하세요.

```bash
npm run dev
```

코드를 새로 받아 왔다면(`git pull`) 패키지와 테이블이 바뀌었을 수 있으니 한 번씩 더 실행합니다.

```bash
npm install
```

```bash
npm run db:migrate
```

### 두 사람으로 써 보기

한 브라우저에서는 한 계정만 로그인됩니다. 두 번째 사람은 **다른 브라우저**나 **시크릿 창**(Chrome: `Ctrl + Shift + N`)으로 접속하세요.

1. A가 회원가입 → 홈에서 **새 공간 만들기** → 초대 코드 **복사**
2. B가 회원가입 → **초대 코드로 참여** 탭에 코드 입력
3. 서로 일기를 쓰고 공감과 댓글을 남깁니다. 다른 탭에 갔다 돌아오면 친구의 새 일기가 반영됩니다.

> 같은 와이파이의 휴대폰으로 접속해 보고 싶다면 `frontend/vite.config.js` 의 `server` 에 `host: true` 를 추가하고 `npm run dev` 를 다시 실행하세요. 터미널에 나오는 `Network: http://192.168.x.x:5173/` 주소를 휴대폰에서 열면 됩니다. (Windows 방화벽이 물어보면 '허용')

### Docker로 서버에 올리기 (학교 서버 등)

서버에 Docker(Compose 포함)만 있으면 됩니다. Node나 MySQL을 따로 설치하지 않아도 됩니다.

```bash
git clone https://github.com/ci667702-star/deardays.git
```

```bash
cd deardays
```

```bash
cp .env.example .env
```

`.env` 를 열어 `DB_ROOT_PASSWORD`, `DB_PASSWORD`, `JWT_SECRET` 을 채웁니다. 값은 서버에서 `openssl rand -hex 24`(비밀번호), `openssl rand -hex 48`(JWT) 로 만들면 편합니다. 80번 포트를 이미 쓰고 있다면 `WEB_PORT` 를 `8080` 처럼 바꾸세요.

```bash
docker compose up -d --build
```

처음에는 이미지를 받고 빌드하느라 몇 분 걸립니다. `docker compose ps` 에서 세 개가 모두 `Up` 이면 `http://서버주소:WEB_PORT` 로 접속하세요.

구성은 세 컨테이너입니다. 바깥으로 열리는 포트는 `web` 하나뿐입니다.

| 컨테이너 | 하는 일 |
| --- | --- |
| `web` | nginx. 화면 파일을 주고, `/api` 와 `/uploads` 요청을 `api` 로 넘김 |
| `api` | Node API 서버. 켜질 때 DB 마이그레이션을 자동으로 적용 |
| `db` | MySQL 8.4. 데이터는 `db-data` 볼륨, 사진은 `uploads` 볼륨에 저장 |

| 하고 싶은 일 | 명령어 |
| --- | --- |
| 상태 보기 | `docker compose ps` |
| 로그 보기 | `docker compose logs -f api` |
| 코드 업데이트 후 다시 배포 | `git pull` 후 `docker compose up -d --build` (마이그레이션 자동) |
| 끄기 (데이터 유지) | `docker compose down` |
| 데이터까지 모두 삭제 (되돌릴 수 없음) | `docker compose down -v` |
| DB 백업 | `docker compose exec db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqldump -u root deardays' > backup.sql` |
| 사진 백업 | `docker compose cp api:/data/uploads ./uploads-backup` |
| 체험 데이터 넣기 (선택) | `docker compose exec api npm run db:seed` |

> HTTPS가 필요하면 학교 서버 앞단의 웹 서버(또는 Caddy 같은 프록시)에서 인증서를 붙이고 `WEB_PORT` 로 넘겨 주세요.

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
| `P1000: Authentication failed` | 비밀번호가 틀렸거나, 특수문자를 바꿔 쓰지 않았습니다 (4단계 표 참고) |
| `P1001: Can't reach database server` | MySQL이 꺼져 있습니다. 관리자 PowerShell에서 `net start MySQL80` |
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

<details>
<summary>Docker 없이 직접 배포할 때</summary>

서버에 Docker가 있다면 위의 "Docker로 서버에 올리기"가 가장 간단합니다. Docker를 쓸 수 없을 때만 참고하세요.

- `npm run build:web` 으로 만든 `frontend/dist` 를 정적 호스팅에 올리고, 빌드 전에 `frontend/.env` 의 `VITE_API_URL` 에 API 서버 주소를 적습니다.
- API 서버는 `backend` 폴더에서 `npm start` 로 실행하고, `.env` 에 `NODE_ENV=production`, 실제 `CLIENT_ORIGIN`(화면 주소), 32자 이상 `JWT_SECRET` 을 설정합니다.
- 서버에서는 `npm run db:migrate` 로 테이블을 만들고, 시드는 넣지 않습니다.
- `backend/uploads` 폴더는 사용자가 올린 사진이 쌓이는 곳이므로 백업 대상에 넣으세요.

</details>

---

## 기술 스택

- **Frontend**: React 19, Vite 7, React Router 7, Axios, Tailwind CSS 4, Lucide React
- **Backend**: Node.js (20 이상), Express 5, JWT, bcrypt, Multer, zod(입력 검증), helmet, express-rate-limit
- **Database**: MySQL 8, Prisma ORM 6
- **글꼴**: [Galmuri](https://github.com/quiple/galmuri) (시스템 UI 픽셀 글꼴, OFL), Gowun Batang (사람이 쓴 글, OFL)

## 폴더 구조

```
deardays/
├── package.json                 # 한 번에 설치·실행하는 편의 스크립트
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # DB 모델 (User, DiaryRoom, DiaryRoomMember, Diary, DiaryImage, Comment, Like, Todo)
│   │   ├── migrations/          # 마이그레이션 SQL
│   │   └── seed.js              # 체험용 계정·일기
│   ├── scripts/
│   │   ├── create-env.js        # npm run setup:env
│   │   └── smoke-test.js        # API 통합 테스트 (두 사용자 시나리오 전체)
│   ├── src/
│   │   ├── config/              # 환경변수, Prisma 클라이언트, 서비스 규칙 상수
│   │   ├── controllers/         # 요청 → 서비스 호출 → 응답
│   │   ├── middlewares/         # JWT 인증, 입력 검증, 업로드, 에러 처리, 요청 제한
│   │   ├── routes/              # REST 라우트
│   │   ├── services/            # 비즈니스 로직과 권한 검사
│   │   ├── utils/               # 날짜, 초대 코드, 직렬화, 파일 등
│   │   ├── validators/          # zod 입력 스키마
│   │   ├── app.js               # Express 앱 구성
│   │   └── server.js            # 서버 실행 + 시작 시 DB 연결 확인
│   ├── uploads/                 # 업로드 이미지 (diaries/, profiles/)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # ui(창·버튼·대화상자 등), diary, room, todo, calendar, layout
│   │   ├── context/             # 로그인, 공유 공간, 알림 상태
│   │   ├── hooks/               # useFetch, useCalendarDays 등
│   │   ├── layouts/             # 바탕 화면(작업 표시줄) / 로그인 화면
│   │   ├── pages/               # 화면별 페이지
│   │   ├── services/            # API 호출 (axios)
│   │   ├── utils/               # 날짜, 도트 아이콘, 저장소 등
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env.example
└── README.md
```

## API

모든 응답은 JSON입니다. 실패 시 `{ "message": "사용자에게 보여 줄 문구", "code": "ERROR_CODE" }` 형태로 응답합니다.
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
| POST | `/api/diaries` | 일기 작성 (multipart: `roomId, title, content, diaryDate, mood?, weather?, images[]`) | 인증 |
| GET | `/api/diaries?roomId=&sort=latest\|oldest&date=&month=&page=&limit=` | 일기 목록 | 인증 |
| GET | `/api/diaries?roomId=&q=&authorId=&from=&to=` | 일기 찾기 (제목·내용 낱말, 쓴 사람, 날짜 범위. `%` `_` 도 글자 그대로) | 인증 |
| GET | `/api/diaries/calendar?roomId=&month=YYYY-MM` | 달력용 날짜별 일기 요약 | 인증 |
| GET | `/api/diaries/:id` | 일기 상세 | 인증 |
| PUT | `/api/diaries/:id` | 일기 수정 (multipart: `title, content, diaryDate, mood?, weather?, removeImageIds(JSON 배열), images[]`), 작성자만 | 인증 |
| DELETE | `/api/diaries/:id` | 일기 삭제 (사진 파일도 삭제), 작성자만 | 인증 |
| POST | `/api/diaries/:id/comments` | 댓글 작성 `{ content }` | 인증 |
| GET | `/api/diaries/:id/comments` | 댓글 목록 | 인증 |
| PUT | `/api/comments/:id` | 댓글 수정, 작성자만 | 인증 |
| DELETE | `/api/comments/:id` | 댓글 삭제, 작성자만 | 인증 |
| POST | `/api/diaries/:id/likes` | 공감 (여러 번 눌러도 1회) → `{ liked, likeCount }` | 인증 |
| DELETE | `/api/diaries/:id/likes` | 공감 취소 | 인증 |
| GET | `/api/todos?roomId=` | 할 일 목록 + 개수 `{ items, counts: { total, done, open } }` (남은 일·기한 가까운 순) | 인증 |
| POST | `/api/todos` | 할 일 추가 `{ roomId, content, dueDate?, assigneeId? }` (맡은 사람 비우면 '함께') | 인증 |
| PUT | `/api/todos/:id` | 내용·기한·맡은 사람 수정, 추가한 사람만 | 인증 |
| PATCH | `/api/todos/:id/status` | 완료 표시/취소 `{ isDone }`, 공간의 두 사람 모두 가능 | 인증 |
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
| PUT | `/api/users/me/password` | 비밀번호 바꾸기 `{ currentPassword, newPassword }` → 새 토큰. 예전 토큰은 모두 무효 | 인증 |
| DELETE | `/api/users/me` | 회원 탈퇴 `{ password }` | 인증 |
| PUT | `/api/users/me` | 닉네임·자기소개 수정 | 인증 |
| POST | `/api/users/me/profile-image` | 프로필 사진 업로드 (multipart: `image`) | 인증 |
| DELETE | `/api/users/me/profile-image` | 기본 프로필로 | 인증 |
| GET | `/api/health` | 서버·DB 상태 | |

## 보안과 규칙

- 비밀번호는 bcrypt(12 rounds)로 저장합니다. 없는 이메일로 로그인할 때도 비교 시간을 맞춰 계정 존재 여부가 드러나지 않게 했습니다.
- 모든 보호 API는 JWT 미들웨어를 거치고, 토큰이 유효해도 계정이 사라졌으면 거부합니다.
- 공유 공간·일기·댓글·공감은 **그 공간의 멤버만** 접근할 수 있습니다. 멤버가 아니면 존재 여부도 숨기고 404로 응답합니다.
- 일기와 댓글의 수정·삭제는 작성자 본인만 할 수 있습니다(403).
- 할 일은 공간의 두 사람 모두 추가하고 체크할 수 있고, 내용 수정과 삭제는 추가한 사람만 할 수 있습니다. 맡을 사람은 그 공간의 멤버만 지정할 수 있습니다.
- 타임캡슐 편지는 서버가 여는 날을 판단합니다(서버 시간대 기준, Docker는 `Asia/Seoul`). 여는 날 전에는 받는 사람에게 제목·내용을 보내지 않습니다.
- 비밀번호를 바꾸면 그 전에 발급된 로그인 토큰은 모두 무효가 되고(다른 기기 로그아웃), 비밀번호를 확인하는 요청(변경·탈퇴)은 로그인처럼 틀린 시도 횟수를 제한합니다.
- 회원 탈퇴 시 내가 쓴 일기·사진 파일·댓글·공감·할 일·편지·알림을 지웁니다. 혼자 쓰던 공간은 공간째 지우고, 친구가 있는 공간은 친구에게 남기며 내가 맡았던 할 일은 '함께'로 바뀝니다.
- 일기 임시 저장은 이 기기의 브라우저에만 남고(사진 제외), 직접 로그아웃하면 지워집니다.
- 한 공간은 최대 2명입니다. 두 사람이 동시에 같은 코드로 참여해도 DB 행 잠금(`SELECT ... FOR UPDATE`)으로 한 명만 들어갑니다.
- 같은 일기에 같은 사람이 두 번 공감할 수 없도록 `(diaryId, userId)` 복합 unique 제약을 둡니다.
- 업로드는 확장자(.jpg .jpeg .png .gif .webp)와 MIME 타입을 함께 검사하고, 저장 후 파일 앞부분의 시그니처로 실제 이미지인지 한 번 더 확인합니다. 파일 이름은 추측할 수 없는 UUID로 바꿉니다. 실패한 요청에서 저장된 파일은 지웁니다.
- 로그인(실패 시도만)·회원가입·이메일 확인에 IP당 요청 제한을 둡니다.
- 비밀 값은 `.env` 로 관리하며 git에 올리지 않습니다.

### 공간 나가기 규칙

- 두 사람 중 한 명이 나가면 공간과 일기는 남은 사람에게 그대로 남고, 예전 초대 코드는 무효가 되며 새 코드가 발급됩니다. 나간 사람이 맡았던 할 일은 '함께' 하는 일로 바뀝니다.
- 마지막 사람이 나가면 공간과 모든 일기·사진·댓글·할 일이 삭제됩니다. (화면에서 한 번 더 확인합니다.)

> 업로드한 사진은 `/uploads/...` 주소로 제공됩니다. 주소가 추측 불가능한 UUID라 링크를 아는 사람만 열 수 있지만, 로그인 검사는 하지 않습니다. 더 엄격하게 하려면 서명된 URL 방식으로 바꾸는 것을 권합니다.

## 테스트

API 서버를 켠 상태(`npm run dev` 또는 `npm run dev:api`)에서 다른 터미널에 실행합니다.

```bash
npm run test:api
```

세 명의 사용자로 가입·로그인, 공간 생성/참여(정원 초과, 동시 참여 경쟁 포함), 사진 업로드 검증(가짜 이미지·허용되지 않는 확장자·장수 초과), 일기 CRUD와 권한, 정렬·날짜 필터·페이지네이션·달력, 공감 중복 방지, 댓글 권한, 할 일(추가·정렬·체크·수정/삭제 권한·맡을 사람 검증), 기분·날씨, 검색(`%`·`_` 글자 그대로 찾기 포함), 새 소식 알림(종류별 생성·읽음 처리·남의 알림 차단), 타임캡슐 편지(봉인·열기·삭제 권한), 비밀번호 변경(예전 토큰 무효), 회원 탈퇴(혼자/함께 쓰던 공간), 마이페이지, 공간 나가기와 파일 정리까지 152개 항목을 확인합니다. 테스트 계정은 실행할 때마다 새로 만들어집니다.

## 디자인 노트

- 창, 버튼, 입력칸은 옛 윈도우의 2px 입체 테두리(흰색·밝은 회색 / 회색·검정)를 그대로 씁니다. 색 구성표는 두 가지입니다.
  - **클래식 (회색)**: 회색 창, 청록 바탕, 남색 제목 표시줄. 기본값입니다.
  - **자두 (보라·분홍)**: 자두색 바탕, 분홍빛 창, 자주에서 분홍으로 번지는 제목 표시줄.
  - 시작 메뉴의 **화면 색 바꾸기...** 또는 내 정보 화면에서 바꿀 수 있고, 기기마다 기억합니다.
- 시스템이 하는 말(메뉴, 버튼, 안내)은 픽셀 글꼴, 사람이 쓴 글(일기, 댓글, 자기소개)은 바탕체로 구분합니다.
- 내 일기는 분홍 봉인 편지, 친구 일기는 라벤더 봉인 편지 아이콘으로 표시하고, 달력의 하트 색도 같은 규칙을 따릅니다.
- 아이콘은 `frontend/src/utils/pixelIcons.js` 의 16×16 문자 격자로 직접 그렸습니다.
- 창의 접기(_)·최대화(□)·닫기(×) 버튼, 작업 표시줄, 시작 메뉴(↑↓ 키 이동), 달력(화살표 키 이동)이 모두 실제로 동작합니다.
