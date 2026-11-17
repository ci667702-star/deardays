# DearDays 화면: Vite로 빌드한 정적 파일을 nginx 가 제공하고, /api 와 /uploads 는 API 컨테이너로 넘긴다.

FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# 비워 두면 같은 주소(nginx)로 API를 부른다. API를 다른 주소에 둘 때만 지정.
ARG VITE_API_URL=
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
