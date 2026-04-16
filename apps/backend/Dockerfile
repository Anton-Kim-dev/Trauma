FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json .
COPY packages/ packages/
COPY apps/medical-appointment-backend/ apps/medical-appointment-backend/

RUN npm install
RUN npm run build --workspace=apps/medical-appointment-backend

ARG SERVICE
ENV SERVICE=${SERVICE}

CMD node apps/medical-appointment-backend/dist/apps/medical-appointment-backend/src/services/${SERVICE}/index.js