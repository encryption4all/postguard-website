FROM nginx:1.23.1

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY postguard-fallback/frontend/dist /usr/share/nginx/html/fallback
COPY cryptify/cryptify-front-end/build /usr/share/nginx/html/filesharing
COPY postguard-tb-addon/dist /usr/share/nginx/html/downloads
COPY build /usr/share/nginx/html/postguard
