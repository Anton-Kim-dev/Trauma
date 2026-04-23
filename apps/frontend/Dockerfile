FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL=/api
ARG DASHBOARD_URL=/dashboard
ARG MEDICAL_URL=/medical

ENV VITE_API_URL=${VITE_API_URL}
ENV DASHBOARD_URL=${DASHBOARD_URL}
ENV MEDICAL_URL=${MEDICAL_URL}

COPY package*.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/webpack-config/package.json packages/webpack-config/
COPY apps/host/package.json apps/host/
COPY apps/dashboard/package.json apps/dashboard/
COPY apps/medical/package.json apps/medical/

RUN npm install

COPY packages/ packages/
COPY apps/host/ apps/host/
COPY apps/dashboard/ apps/dashboard/
COPY apps/medical/ apps/medical/

RUN npm run build:frontend

FROM alpine:3.20
WORKDIR /app

COPY --from=build /app/apps/host/dist /build/host
COPY --from=build /app/apps/dashboard/dist /build/dashboard
COPY --from=build /app/apps/medical/dist /build/medical

CMD ["sh", "-c", "mkdir -p /usr/share/nginx/html/dashboard /usr/share/nginx/html/medical && cp -r /build/host/. /usr/share/nginx/html/ && cp -r /build/dashboard/. /usr/share/nginx/html/dashboard/ && cp -r /build/medical/. /usr/share/nginx/html/medical/ && tail -f /dev/null"]
