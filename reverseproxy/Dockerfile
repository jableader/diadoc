FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /etc/nginx/conf.d/*

ENTRYPOINT [ "nginx",  "-g", "daemon off;" ]