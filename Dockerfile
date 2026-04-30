# Production SPA: build with Vite, serve static files with nginx (client-side routing).
#
# `vite build` reads `.env.production` from the repo (copied into the image). `.env` is dockerignored.
# Optional Docker build-arg overrides: docker build --build-arg VITE_API_BASE_URL=https://api.example.com .
#
# Dokploy: add the same build-arg if you want to override `.env.production` without committing URL changes.

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=https://api.job-platform.hugomalzieux.com
RUN set -eux; \
    if [ -n "${VITE_API_BASE_URL:-}" ]; then export VITE_API_BASE_URL; fi; \
    npm run build

FROM nginx:1.27-alpine AS runner

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

LABEL traefik.docker.network=dokploy-network

EXPOSE 3008
CMD ["nginx", "-g", "daemon off;"]
