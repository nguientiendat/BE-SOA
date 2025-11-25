FROM node:18-alpine

WORKDIR /app

COPY ./services/user-service/package*.json ./

RUN npm install 

COPY ./services/user-service/src ./src
COPY ./shared /shared



EXPOSE 3007
CMD ["npm", "start"]