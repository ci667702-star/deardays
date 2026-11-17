# DearDays API 서버
FROM node:24-bookworm-slim

# Prisma 엔진이 쓰는 OpenSSL
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000 \
    UPLOAD_DIR=/data/uploads \
    CHECKPOINT_DISABLE=1 \
    PRISMA_HIDE_UPDATE_MESSAGE=1

# 의존성 설치. postinstall 에서 prisma generate 가 돌기 때문에 스키마를 먼저 복사한다.
# 시작할 때 마이그레이션에 prisma CLI(devDependency)가 필요해서 --include=dev
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --include=dev && npm cache clean --force

COPY src ./src
COPY scripts ./scripts

# 업로드 사진은 볼륨(/data/uploads)에 저장. 이미지 안에서 node 사용자 소유로 만들어 두면
# 처음 연결되는 named volume 도 같은 권한을 물려받는다.
RUN mkdir -p /data/uploads/diaries /data/uploads/profiles && chown -R node:node /data
USER node

EXPOSE 4000

# DB 접속 주소를 만들고(비밀번호 URL 인코딩) 마이그레이션을 적용한 뒤 서버 실행.
# node 가 직접 PID 1 이 되어 docker stop 의 종료 신호(SIGTERM)를 받는다.
CMD ["node", "scripts/docker-start.js"]
