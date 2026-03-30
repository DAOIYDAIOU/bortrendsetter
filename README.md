# Trendsetter Market — Telegram bot + Mini App + Admin

Готовый starter-kit для магазина одежды в Telegram:

- бот на **Telegraf**
- **Mini App** внутри Telegram
- **админка** `/admin`
- база **PostgreSQL** через **Prisma**
- деплой под **Railway**

## Что умеет

- `/start` у бота показывает кнопку `Открыть магазин`
- меню бота тоже открывает Mini App
- Mini App показывает каталог, корзину и оформление заказа
- заказы пишутся в базу
- новые заказы отправляются в `ADMIN_CHAT_ID`
- админка позволяет:
  - войти по логину/паролю
  - менять описание магазина
  - создавать, редактировать, удалять товары
  - менять статусы заказов

## Стек

- Node.js 20
- Express
- Telegraf
- Prisma
- PostgreSQL
- HTML/CSS/JS frontend

## Локальный запуск

```bash
npm install
cp .env.example .env
```

Заполни `.env`, потом:

```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

Откроется:

- `http://localhost:3000/app`
- `http://localhost:3000/admin`

## Railway деплой

### 1. Залей проект в GitHub

Создай новый репозиторий и загрузи файлы.

### 2. Создай проект в Railway

- New Project
- Deploy from GitHub Repo
- выбери репозиторий

### 3. Добавь PostgreSQL

В Railway добавь сервис **Postgres**.

### 4. Пропиши Variables

В сервисе с приложением добавь:

- `APP_URL`
- `BOT_TOKEN`
- `JWT_SECRET`
- `ADMIN_LOGIN`
- `ADMIN_PASSWORD`
- `ADMIN_CHAT_ID`
- `STORE_NAME`
- `STORE_DESCRIPTION`
- `DELIVERY_NOTE`
- `DEFAULT_CURRENCY`
- `DATABASE_URL`

`DATABASE_URL` можно подтянуть из Postgres сервиса Railway.

### 5. Первый запуск базы

После первого деплоя открой Railway shell и выполни:

```bash
npx prisma migrate deploy
node prisma/seed.js
```

Если миграций нет и хочешь просто быстро развернуть:

```bash
npx prisma db push
node prisma/seed.js
```

### 6. Сгенерируй домен

В Railway у сервиса:

- Settings / Networking
- Generate Domain

Этот домен вставь в `APP_URL`

### 7. Проверь Telegram Mini App

После обновления `APP_URL` перезапусти деплой.

Бот автоматически:

- ставит команды
- ставит `Menu Button` с Mini App

## Настройка у BotFather

Через `@BotFather`:

- создай бота
- получи `BOT_TOKEN`
- при желании поставь аватар и описание

После деплоя просто напиши боту `/start`.

## Как получить ADMIN_CHAT_ID

Самый простой путь:

1. Напиши своему боту любое сообщение.
2. Открой в браузере:

```text
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```

3. Найди `chat.id`.
4. Вставь это значение в `ADMIN_CHAT_ID`.

## Важные замечания

- Mini App авторизация проверяется по `initData`.
- Хранить SQLite на Railway для магазина не надо — используй Postgres.
- Картинки товаров сейчас задаются через URL в админке.
- Дефолтная аватарка магазина лежит в `public/app/avatar.png`.

## Куда что открывать

- Mini App: `/app`
- Админка: `/admin`
- Healthcheck: `/health`

## Что можно улучшить дальше

- загрузку фото файлов в S3 / Cloudinary
- оплату через Telegram Stars / external payment
- промокоды
- фильтры по категориям
- доставку и трекинг
- роли менеджеров
