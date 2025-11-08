FROM node:18-alpine

WORKDIR /app

COPY ./services/order-service/package*.json ./

RUN npm install

COPY ./services/order-service/src ./src
COPY ./shared /shared
COPY ./services/order-service/jobs ./jobs

EXPOSE 3005

CMD ["npm", "start"]

