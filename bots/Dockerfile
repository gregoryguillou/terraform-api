FROM node:9.8.0-stretch

EXPOSE 8080

WORKDIR /app
COPY . /app/
RUN npm install --production=true

CMD [ "npm", "start" ]
