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

# 🔥 финальный запуск БЕЗ seed (чтобы не падал)
CMD ["sh", "-c", "npx prisma db push && node src/server.js"]
