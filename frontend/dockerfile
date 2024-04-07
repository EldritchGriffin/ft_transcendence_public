FROM node:lts

WORKDIR /app

COPY ./package*.json /app

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]