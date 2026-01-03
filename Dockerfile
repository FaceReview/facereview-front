# 1. Build Stage
# [변경 1] alpine -> slim (Debian 기반으로 변경하여 호환성 문제 해결)
FROM node:20-slim AS builder
WORKDIR /app

# slim 이미지는 libc6-compat 설치가 필요 없습니다. (삭제함)

# Yarn Berry 활성화
RUN corepack enable

# 의존성 복사 및 설치
COPY package.json yarn.lock ./
RUN yarn install --immutable

# [변경 2] vite 뿐만 아니라 rollup도 같이 압축 해제
# @rollup/plugin-commonjs 등 관련 플러그인이 있다면 추가해야 할 수도 있지만,
# 일단 에러가 난 rollup을 추가합니다.
RUN yarn unplug vite rollup

# 소스 코드 복사
COPY . .

# 빌드 실행
RUN yarn build

# 2. Run Stage
# 실행 환경도 slim 기반 nginx 권장 (혹은 호환성 위해 nginx:alpine 유지 가능하나 통일성 위해 변경 추천)
# 여기서는 용량을 위해 nginx:alpine을 유지해도 무방합니다.
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]