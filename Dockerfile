FROM node:18.7.0-alpine3.15 AS build

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

COPY . .

RUN npm run build

FROM nginx:1.22.0-alpine AS runtime

COPY --from=build /app/build/ /usr/share/nginx/html/

COPY --from=build /app/docker-entrypoint.d/40-generate-config.sh /docker-entrypoint.d/40-generate-config.sh
