FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

# фейковый DATABASE_URL только для build-этапа
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npx prisma db push && node src/server.js"]
