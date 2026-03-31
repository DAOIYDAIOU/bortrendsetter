FROM node:20-alpine

WORKDIR /app

# фикс для Prisma
RUN apk add --no-cache openssl libc6-compat

# зависимости
COPY package*.json ./
RUN npm install

# prisma
COPY prisma ./prisma
RUN npx prisma generate

# весь проект
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# 🔥 ВАЖНО: создаем таблицы + сид + запускаем сервер
CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js && node src/server.js"]
