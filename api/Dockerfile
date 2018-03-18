FROM debian:stretch

RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y curl unzip git build-essential git jq

RUN curl -sL https://deb.nodesource.com/setup_9.x | bash - && \
    apt-get install -y nodejs

EXPOSE 10010

COPY package.json /app/
WORKDIR /app
RUN npm install
CMD [ "npm", "start" ]

COPY . /app/
