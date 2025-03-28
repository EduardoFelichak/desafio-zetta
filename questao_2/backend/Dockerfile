FROM node:23-slim

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=development
RUN npm install --include=dev
RUN apt-get update -y && apt-get install -y openssl

COPY . .

RUN npx prisma generate

EXPOSE 3333

CMD sh -c "npx prisma migrate deploy && npx tsx prisma/seed.ts && npm run dev"