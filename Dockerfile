# 1. Build Stage
FROM node:20-slim AS builder
WORKDIR /app

# Yarn Berry 활성화
RUN corepack enable

# [이 부분이 핵심입니다!]
# 사용자님 프로젝트에 .yarnrc.yml 파일이 없기 때문에,
# Docker가 "내가 직접 만들어서 설정할게!" 라고 하는 명령어입니다.
# 이렇게 하면 Docker 안에서는 'node_modules' 폴더가 생겨서 에러가 사라집니다.
RUN echo 'nodeLinker: node-modules' > .yarnrc.yml

# 의존성 복사 (yarn.lock은 있다고 하셨으니 복사합니다)
COPY package.json yarn.lock ./

# 의존성 설치
# 위에서 만든 설정 파일 덕분에 PnP가 꺼지고 node_modules가 설치됩니다.
RUN yarn install --immutable

# 소스 코드 복사
COPY . .

# 빌드 실행 (이제 Vite가 node_modules를 보고 행복하게 빌드합니다)
RUN yarn build

# 2. Run Stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]