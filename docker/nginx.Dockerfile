FROM nginx:1.23.1

EXPOSE 80

COPY nginx.conf /etc/nginx/nginx.conf
COPY /fallback /user/share/nginx/html/fallback
COPY /cryptify /user/share/nginx/html/cryptify
