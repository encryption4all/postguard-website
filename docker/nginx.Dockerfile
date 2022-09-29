FROM nginx:1.23.1

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY postguard-fallback/frontend/dist /user/share/nginx/html/fallback
COPY cryptify/cryptify-front-end/build /user/share/nginx/html/cryptify
COPY build server

CMD ["/bin/bash", "-c", "node server && nginx -g daemon off;"]

EXPOSE 80
