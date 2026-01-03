# 1. Build Stage
# 호환성을 위해 Slim 이미지 유지
FROM node:20-slim AS builder
WORKDIR /app

# Yarn Berry 활성화
RUN corepack enable

# 의존성 복사 및 설치
COPY package.json yarn.lock ./
RUN yarn install --immutable

# [핵심 수정]
# 1. rollup이 package.json에 없어서 에러가 났으므로,
#    컨테이너 안에서 임시로 설치해서 직접 의존성으로 등록합니다.
RUN yarn add -D rollup

# 2. 이제 rollup이 등록되었으므로 vite와 함께 압축을 풉니다.
RUN yarn unplug vite rollup

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