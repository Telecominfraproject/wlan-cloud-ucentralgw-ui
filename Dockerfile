FROM node:16-alpine3.11 AS build

COPY package.json package-lock.json /

RUN npm install

COPY . .

RUN echo '{"DEFAULT_GATEWAY_URL": "https://ucentral.dpaas.arilia.com:16001","ALLOW_GATEWAY_CHANGE": true}' > public/config.json \
    && npm run build

FROM nginx:1.20.1-alpine AS runtime

COPY --from=build /build/ /usr/share/nginx/html/
