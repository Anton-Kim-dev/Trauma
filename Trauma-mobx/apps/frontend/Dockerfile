FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

COPY apps/frontend/package.json ./
COPY apps/frontend/tsconfig.json ./
COPY apps/frontend/tsconfig.app.json ./
COPY apps/frontend/tsconfig.node.json ./
COPY apps/frontend/vite.config.ts ./
COPY apps/frontend/index.html ./
COPY apps/frontend/src ./src

RUN npm install
RUN npm run build

FROM alpine:3.20
WORKDIR /app
RUN apk add --no-cache bash
COPY --from=build /app/dist /build

CMD ["sh", "-c", "mkdir -p /usr/share/nginx/html && rm -rf /usr/share/nginx/html/* && cp -r /build/. /usr/share/nginx/html && tail -f /dev/null"]
