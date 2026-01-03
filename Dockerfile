# 1. Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# [핵심 1] Alpine에서 Vite(esbuild) 구동을 위한 필수 라이브러리 설치
# 이게 없으면 PnP 환경에서 바이너리 실행이 실패할 수 있습니다.
RUN apk add --no-cache libc6-compat

# Yarn Berry 활성화
RUN corepack enable

# 의존성 복사 및 설치 (PnP 모드 유지!)
COPY package.json yarn.lock ./
RUN yarn install --immutable

# [핵심 2] Vite만 압축 해제 (Unplug)
# PnP Zip 파일 내부에서 경로를 못 찾는 문제를 해결하기 위해
# Vite 패키지만 물리적인 폴더로 뺍니다.
RUN yarn unplug vite

# 소스 코드 복사
COPY . .

# 빌드 실행
RUN yarn build

# 2. Run Stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]