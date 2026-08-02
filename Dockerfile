FROM node:26-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run typecheck

EXPOSE 5122

CMD ["npm", "run", "start"]
