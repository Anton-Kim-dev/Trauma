FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json .
COPY packages/ packages/
COPY apps/backend/ apps/backend/

RUN npm install
RUN npm run build --workspace=apps/backend

ARG SERVICE
ENV SERVICE=${SERVICE}

CMD node apps/backend/dist/apps/backend/src/services/${SERVICE}/index.js