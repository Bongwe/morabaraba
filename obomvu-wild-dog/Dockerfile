FROM nginx:alpine
# Unity WebGL build output (index.html, Build/, TemplateData/, ...) lives in ./webgl
COPY webgl /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
