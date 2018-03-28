FROM node:9.8.0-stretch

EXPOSE 8080
CMD [ "npm", "start" ]

WORKDIR /app
COPY package.json /app/
RUN npm install --production

COPY . /app/

