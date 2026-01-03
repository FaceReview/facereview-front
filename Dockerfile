# 1. Build Stage
FROM node:20-slim AS builder
WORKDIR /app

# Yarn Berry 활성화
RUN corepack enable

# [핵심] Docker 안에서만 node_modules 방식 강제 (빌드 에러 해결됨!)
RUN echo 'nodeLinker: node-modules' > .yarnrc.yml

# 의존성 복사 및 설치
COPY package.json yarn.lock ./
RUN yarn install --immutable

# 소스 코드 복사
COPY . .

# 빌드 실행 (성공함!)
RUN yarn build

# 2. Run Stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# [수정됨] 빌드 결과물이 'build' 폴더에 생기므로 여기를 복사해야 합니다.
# (기존: /app/dist -> 변경: /app/build)
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]