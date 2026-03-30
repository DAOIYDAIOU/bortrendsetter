FROM node:20-alpine

WORKDIR /app

# 🔥 фикс Prisma (openssl)
RUN apk add --no-cache openssl libc6-compat

# зависимости
COPY package*.json ./
RUN npm install

# prisma
COPY prisma ./prisma
RUN npx prisma generate

# остальной код
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# 🚀 запуск только сервера
CMD ["node", "src/server.js"]
