# syntax=docker/dockerfile:1

# 1. Build Stage
FROM --platform=$BUILDPLATFORM node:20-slim AS builder
WORKDIR /app

# Activate the Yarn version declared in packageManager
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

# Use node-modules linker inside the container (PnP is not used in Docker).
RUN echo 'nodeLinker: node-modules' > .yarnrc.yml

# Install dependencies (cached layer)
# .yarnrc.yml is created by the RUN echo above; only copy files from the host context.
COPY package.json yarn.lock ./
RUN yarn install --immutable

# Build application
COPY . .
RUN yarn build

# 2. Run Stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx /app/build /usr/share/nginx/html

# Run as a non-root user
USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
