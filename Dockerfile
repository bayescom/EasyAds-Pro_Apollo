# build
FROM node:16.20.2-alpine AS build
COPY . /Apollo/

WORKDIR /Apollo
# 配置Luna域名 
ENV DOMAIN_Luna=your.domain 
RUN npm install && cd src && sed -i 's/${DOMAIN_Luna}/'$DOMAIN_Luna'/g' config.ts && npm run build
# deploy
FROM nginx:stable-alpine

COPY --from=build  /Apollo/build /usr/share/nginx/html

EXPOSE 80
