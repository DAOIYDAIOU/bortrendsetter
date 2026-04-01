import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from './prisma.js';
import { config } from './config.js';
import { adminAuthMiddleware, ensureAdminUser, signAdminToken } from './auth.js';
import { getBot, initBot, verifyTelegramInitData } from './telegram.js';

config.requireForProduction();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(express.static(publicDir));

function money(value, currency) {
  return `${(value / 100).toFixed(2)} ${currency}`;
}

async function ensureStoreSettings() {
  await prisma.storeSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: config.storeName,
      storeDescription: config.storeDescription,
      deliveryNote: config.deliveryNote,
      currency: config.defaultCurrency,
      avatarUrl: '/app/avatar.png',
    },
  });
}

app.get('/', (_req, res) => res.redirect('/app'));

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

app.get('/app', (_req, res) => {
  res.sendFile(path.join(publicDir, 'app', 'index.html'));
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(publicDir, 'admin', 'index.html'));
});

app.post('/api/public/order', async (req, res) => {
  const { initData } = req.body;
  const user = verifyTelegramInitData(initData);

  if (!user) return res.status(401).json({ error: 'Ошибка Telegram' });

  const order = await prisma.order.create({
    data: {
      telegramId: String(user.id),
      totalAmount: 1000,
      items: { create: [] },
    },
  });

  const message = `🛒 Новый заказ #${order.id}`;

  const bot = getBot();

  const chats = [
    config.adminChatId,
    ...config.orderNotifyChatIds,
  ].filter(Boolean);

  if (bot) {
    for (const chatId of chats) {
      try {
        await bot.telegram.sendMessage(chatId, message);
      } catch (e) {
        console.error('send error', e.message);
      }
    }
  }

  res.json({ ok: true });
});

app.post('/api/admin/login', async (req, res) => {
  const { login, password } = req.body;

  if (login !== config.adminLogin || password !== config.adminPassword) {
    return res.status(401).json({ error: 'Неверно' });
  }

  res.json({ token: 'ok' });
});

async function start() {
  await ensureAdminUser();
  await ensureStoreSettings();

  const server = app.listen(config.port, async () => {
    console.log(`Server started on ${config.port}`);
    try {
      await initBot();
    } catch {}
  });

  process.on('SIGTERM', async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}

start();
