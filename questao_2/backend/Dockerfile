FROM node:latest

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --include=dev

COPY . .

RUN npx prisma generate

EXPOSE 3333

CMD ["npm", "run", "dev"]