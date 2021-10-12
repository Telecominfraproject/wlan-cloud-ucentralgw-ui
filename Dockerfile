FROM node:14-alpine3.11 AS build

COPY package.json package-lock.json /

RUN npm install

COPY . .

RUN npm run build

FROM nginx:1.20.1-alpine AS runtime

COPY --from=build /build/ /usr/share/nginx/html/

COPY --from=build docker-entrypoint.d/40-generate-config.sh /docker-entrypoint.d/40-generate-config.sh
