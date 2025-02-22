# Use Node.js LTS (Long Term Support) as base image
FROM node:20-alpine

RUN npm install -g pm2

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

RUN pnpm build

RUN mkdir -p ./logs

EXPOSE 3000

CMD ["pm2-runtime", "start", "npm", "--", "start"]