FROM nginx:alpine

RUN apk add --no-cache gettext

RUN mkdir -p /etc/nginx/templates

COPY ./templates/* /etc/nginx/templates/

CMD envsubst '$$NGINX_SERVER_PORT $$FRONTEND_SERVER_NAME $$FRONTEND_HOST $$FRONTEND_PORT $$API_SERVER_NAME $$API_HOST $$API_PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && \
    nginx -g "daemon off;"
