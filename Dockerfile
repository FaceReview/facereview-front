# 1. Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Yarn Berry 활성화
RUN corepack enable

# 의존성 설치
COPY package.json yarn.lock ./
RUN yarn install --immutable

# 소스 코드 및 .env 복사
COPY . .

# 빌드
RUN yarn build

# 2. Run Stage
FROM nginx:alpine

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# [변경] 내부 포트 80 개방
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]