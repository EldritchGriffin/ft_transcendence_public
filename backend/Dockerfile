FROM node:lts

WORKDIR /app

RUN apt-get update -y && apt-get install -y expect

COPY ./package*.json /app

RUN npm ci && npm install @nestjs/cli -g

COPY . /app

COPY ./tools/entrypoint.sh /app

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]