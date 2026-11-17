# DearDays

친구와 둘이서 쓰는 교환 일기. 옛 윈도우 창 스타일을 파스텔로 다시 칠한 웹 앱입니다.

공유 공간을 만들고 초대 코드로 친구를 부르면, 두 사람만 볼 수 있는 일기장이 열립니다. 일기에는 사진을 붙일 수 있고, 서로의 일기에 하트 공감과 댓글을 남길 수 있습니다. 달력에서는 누가 어느 날 일기를 썼는지 하트로 보여 줍니다.

| 화면 | 하는 일 |
| --- | --- |
| 로그인 · 회원가입 | 이메일 가입, 이메일 중복 확인, 로그인 상태 유지 선택 |
| 홈 (바탕 화면) | 오늘 날짜와 오늘의 한마디, 나와 친구 프로필, 최근 일기 5편, 달력 미리보기 |
| 우리 일기장 | 두 사람 프로필, 초대 코드 복사·재발급, 일기 목록(최신순/과거순, 더 보기), 공간 이름 변경, 공간 나가기, 다른 공간 만들기/참여 |
| 일기 쓰기·수정 | 제목, 날짜, 줄 노트 본문, 사진 최대 6장(끌어다 놓기 지원), 업로드 진행률, 작성 중 이탈 확인 |
| 일기 보기 | 작성자·날짜, 본문, 사진 크게 보기, 하트 공감/취소, 댓글 작성·수정·삭제 (작성자 본인만) |
| 달력 | 월 이동, 오늘 강조, 내가 쓴 날(분홍 하트)·친구가 쓴 날(라벤더 하트), 날짜별 일기, 그 날짜로 일기 쓰기 |
| 내 정보 | 프로필 사진 변경/기본 이미지로, 닉네임·자기소개 수정, 이메일 확인, 작성 통계, 참여 공간 목록, 로그아웃 |

## 기술 스택

- **Frontend**: React 19, Vite 7, React Router 7, Axios, Tailwind CSS 4, Lucide React
- **Backend**: Node.js (20 이상), Express 5, JWT, bcrypt, Multer, zod(입력 검증), helmet, express-rate-limit
- **Database**: MySQL 8, Prisma ORM 6
- **글꼴**: [Galmuri](https://github.com/quiple/galmuri) (시스템 UI 픽셀 글꼴, OFL), Gowun Batang (사람이 쓴 글, OFL)

## 폴더 구조

```
deardays/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # DB 모델 (User, DiaryRoom, DiaryRoomMember, Diary, DiaryImage, Comment, Like)
│   │   ├── migrations/          # 마이그레이션 SQL
│   │   └── seed.js              # 체험용 계정·일기
│   ├── scripts/smoke-test.js    # API 통합 테스트 (두 사용자 시나리오 전체)
│   ├── src/
│   │   ├── config/              # 환경변수, Prisma 클라이언트, 서비스 규칙 상수
│   │   ├── controllers/         # 요청 → 서비스 호출 → 응답
│   │   ├── middlewares/         # JWT 인증, 입력 검증, 업로드, 에러 처리, 요청 제한
│   │   ├── routes/              # REST 라우트
│   │   ├── services/            # 비즈니스 로직과 권한 검사
│   │   ├── utils/               # 날짜, 초대 코드, 직렬화, 파일 등
│   │   ├── validators/          # zod 입력 스키마
│   │   ├── app.js               # Express 앱 구성
│   │   └── server.js            # 서버 실행
│   ├── uploads/                 # 업로드 이미지 (diaries/, profiles/)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # ui(창·버튼·대화상자 등), diary, room, calendar, layout
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

## 설치와 실행

### 1. 준비물

- Node.js 20 이상 (`node -v`)
- MySQL 8 이 실행 중이어야 합니다. (Windows: 서비스 `MySQL80` 이 "실행 중"인지 확인)

### 2. 데이터베이스 만들기

MySQL에 접속해 데이터베이스와 전용 계정을 만듭니다. 비밀번호는 직접 정해 주세요.

```sql
CREATE DATABASE deardays CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'deardays'@'localhost' IDENTIFIED BY '여기에-비밀번호';
GRANT ALL PRIVILEGES ON deardays.* TO 'deardays'@'localhost';
FLUSH PRIVILEGES;
```

> 이미 쓰는 `root` 계정으로 연결해도 됩니다. 그 경우 위 단계는 `CREATE DATABASE` 만 하면 됩니다.
> 스키마를 고쳐 `npx prisma migrate dev` 로 새 마이그레이션을 만들 때는 Prisma가 임시 비교용 DB를 만들므로 DB 생성 권한이 있는 계정(예: root)이 필요합니다. 설치·실행에 쓰는 `migrate deploy` 에는 필요 없습니다.

### 3. 환경변수

```bash
cd deardays/backend
cp .env.example .env
```

`backend/.env` 에서 최소한 아래 두 값을 채웁니다.

| 이름 | 설명 |
| --- | --- |
| `DATABASE_URL` | `mysql://사용자:비밀번호@localhost:3306/deardays` — 비밀번호에 `@ : / #` 등이 있으면 URL 인코딩 (예: `@` → `%40`) |
| `JWT_SECRET` | 32자 이상 임의 문자열. 만들기: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |

나머지(`PORT`, `CLIENT_ORIGIN`, `UPLOAD_DIR`, `MAX_IMAGE_SIZE_MB`, `AUTH_RATE_LIMIT`)는 기본값으로 동작합니다. 프론트엔드는 개발 중 별도 설정이 필요 없습니다(`frontend/.env.example` 참고).

### 4. 설치 · 마이그레이션 · 실행

`deardays/` 폴더에서:

```bash
npm run install:all
```

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

(선택) 체험용 계정 두 개와 일기가 만들어집니다. 계정 정보는 `backend/prisma/seed.js` 맨 위에 있습니다.

터미널 두 개에서 각각 실행합니다.

```bash
npm run dev:api
```

```bash
npm run dev:web
```

브라우저에서 http://localhost:5173 을 엽니다. API는 http://localhost:4000 에서 돌고, 개발 중에는 Vite가 `/api`, `/uploads` 요청을 API 서버로 넘겨 줍니다.

### 두 사람으로 써 보기

한 브라우저에서는 한 계정만 로그인됩니다. 두 번째 사람은 **다른 브라우저**나 **시크릿 창**에서 접속하세요.

1. A가 가입 → 홈에서 "새 공간 만들기" → 초대 코드 복사
2. B가 가입 → "초대 코드로 참여" 탭에 코드 입력
3. 서로 일기를 쓰고, 공감과 댓글을 남겨 보세요. 다른 탭에 갔다 돌아오면 새 일기가 반영됩니다.

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
| POST | `/api/diaries` | 일기 작성 (multipart: `roomId, title, content, diaryDate, images[]`) | 인증 |
| GET | `/api/diaries?roomId=&sort=latest\|oldest&date=&month=&page=&limit=` | 일기 목록 | 인증 |
| GET | `/api/diaries/calendar?roomId=&month=YYYY-MM` | 달력용 날짜별 일기 요약 | 인증 |
| GET | `/api/diaries/:id` | 일기 상세 | 인증 |
| PUT | `/api/diaries/:id` | 일기 수정 (multipart: `title, content, diaryDate, removeImageIds(JSON 배열), images[]`) — 작성자만 | 인증 |
| DELETE | `/api/diaries/:id` | 일기 삭제 (사진 파일도 삭제) — 작성자만 | 인증 |
| POST | `/api/diaries/:id/comments` | 댓글 작성 `{ content }` | 인증 |
| GET | `/api/diaries/:id/comments` | 댓글 목록 | 인증 |
| PUT | `/api/comments/:id` | 댓글 수정 — 작성자만 | 인증 |
| DELETE | `/api/comments/:id` | 댓글 삭제 — 작성자만 | 인증 |
| POST | `/api/diaries/:id/likes` | 공감 (여러 번 눌러도 1회) → `{ liked, likeCount }` | 인증 |
| DELETE | `/api/diaries/:id/likes` | 공감 취소 | 인증 |
| GET | `/api/users/me` | 내 정보 + 통계 + 참여 공간 | 인증 |
| PUT | `/api/users/me` | 닉네임·자기소개 수정 | 인증 |
| POST | `/api/users/me/profile-image` | 프로필 사진 업로드 (multipart: `image`) | 인증 |
| DELETE | `/api/users/me/profile-image` | 기본 프로필로 | 인증 |
| GET | `/api/health` | 서버·DB 상태 | |

## 보안과 규칙

- 비밀번호는 bcrypt(12 rounds)로 저장합니다. 없는 이메일로 로그인할 때도 비교 시간을 맞춰 계정 존재 여부가 드러나지 않게 했습니다.
- 모든 보호 API는 JWT 미들웨어를 거치고, 토큰이 유효해도 계정이 사라졌으면 거부합니다.
- 공유 공간·일기·댓글·공감은 **그 공간의 멤버만** 접근할 수 있습니다. 멤버가 아니면 존재 여부도 숨기고 404로 응답합니다.
- 일기와 댓글의 수정·삭제는 작성자 본인만 할 수 있습니다(403).
- 한 공간은 최대 2명입니다. 두 사람이 동시에 같은 코드로 참여해도 DB 행 잠금(`SELECT ... FOR UPDATE`)으로 한 명만 들어갑니다.
- 같은 일기에 같은 사람이 두 번 공감할 수 없도록 `(diaryId, userId)` 복합 unique 제약을 둡니다.
- 업로드는 확장자(.jpg .jpeg .png .gif .webp)와 MIME 타입을 함께 검사하고, 저장 후 파일 앞부분의 시그니처로 실제 이미지인지 한 번 더 확인합니다. 파일 이름은 추측할 수 없는 UUID로 바꿉니다. 실패한 요청에서 저장된 파일은 지웁니다.
- 로그인(실패 시도만)·회원가입·이메일 확인에 IP당 요청 제한을 둡니다.
- 비밀 값은 `.env` 로 관리하며 git에 올리지 않습니다.

### 공간 나가기 규칙

- 두 사람 중 한 명이 나가면 공간과 일기는 남은 사람에게 그대로 남고, 예전 초대 코드는 무효가 되며 새 코드가 발급됩니다.
- 마지막 사람이 나가면 공간과 모든 일기·사진·댓글이 삭제됩니다. (화면에서 한 번 더 확인합니다.)

> 업로드한 사진은 `/uploads/...` 주소로 제공됩니다. 주소가 추측 불가능한 UUID라 링크를 아는 사람만 열 수 있지만, 로그인 검사는 하지 않습니다. 더 엄격하게 하려면 서명된 URL 방식으로 바꾸는 것을 권합니다.

## 테스트

API 서버를 켠 상태에서:

```bash
npm run test:api
```

세 명의 사용자로 가입·로그인, 공간 생성/참여(정원 초과, 동시 참여 경쟁 포함), 사진 업로드 검증(가짜 이미지·허용되지 않는 확장자·장수 초과), 일기 CRUD와 권한, 정렬·날짜 필터·페이지네이션·달력, 공감 중복 방지, 댓글 권한, 마이페이지, 공간 나가기와 파일 정리까지 73개 항목을 확인합니다. 테스트 계정은 실행할 때마다 새로 만들어집니다.

## 디자인 노트

- 창, 버튼, 입력칸은 옛 윈도우의 2px 입체 테두리 구조를 그대로 쓰고 색만 라벤더·크림·연핑크로 바꿨습니다.
- 시스템이 하는 말(메뉴, 버튼, 안내)은 픽셀 글꼴, 사람이 쓴 글(일기, 댓글, 자기소개)은 바탕체로 구분합니다.
- 내 일기는 분홍 봉인 편지, 친구 일기는 라벤더 봉인 편지 아이콘으로 표시하고, 달력의 하트 색도 같은 규칙을 따릅니다.
- 아이콘은 `frontend/src/utils/pixelIcons.js` 의 16×16 문자 격자로 직접 그렸습니다.
- 창의 접기(_)·최대화(□)·닫기(×) 버튼, 작업 표시줄, 시작 메뉴(↑↓ 키 이동), 달력(화살표 키 이동)이 모두 실제로 동작합니다.

## 문제 해결

| 증상 | 확인할 것 |
| --- | --- |
| API 서버 시작 시 `환경변수 ... 이(가) 비어 있습니다` | `backend/.env` 가 있는지, `DATABASE_URL`·`JWT_SECRET` 을 채웠는지 |
| `P1001: Can't reach database server` | MySQL 서비스가 켜져 있는지, 포트(기본 3306)가 맞는지 |
| `P1000: Authentication failed` | `DATABASE_URL` 의 사용자·비밀번호 (특수문자는 URL 인코딩) |
| 화면에 "서버에 연결할 수 없어요" | API 서버(`npm run dev:api`)가 4000번 포트에서 실행 중인지 |
| 시도가 너무 많다는 메시지 | 15분 뒤 다시 시도하거나 개발 중에는 `AUTH_RATE_LIMIT` 값을 늘리기 |
