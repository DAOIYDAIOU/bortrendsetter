FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

# чтобы prisma не генерировался на этапе npm install
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npx prisma db push && node src/server.js"]
