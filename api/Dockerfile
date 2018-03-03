FROM debian:stretch

RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y curl unzip git build-essential git

RUN curl -sL https://deb.nodesource.com/setup_9.x | bash - && \
    apt-get install -y nodejs

EXPOSE 10010

COPY package.json package-lock.json /app/
WORKDIR /app
RUN npm install
CMD [ "npm", "start" ]

COPY app.js entrypoint.sh /app/
COPY api /app/api
COPY projects /app/projects
COPY config /app/config
