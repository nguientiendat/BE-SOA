FROM node:18-alpine

WORKDIR /app

COPY ./services/cart-service/package*.json ./

RUN npm install

COPY ./services/cart-service/src ./src
COPY ./shared /shared

EXPOSE 3003

CMD ["npm", "start"]





