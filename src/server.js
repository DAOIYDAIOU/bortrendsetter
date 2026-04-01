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
      currency: config.currency,
      avatarUrl: '/app/avatar.png',
    },
  });
}

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/public/settings', async (_req, res) => {
  const settings = await prisma.storeSetting.findUnique({ where: { id: 1 } });
  res.json(settings);
});

app.get('/api/public/products', async (req, res) => {
  const category = req.query.category?.toString();
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(products);
});

app.post('/api/public/order', async (req, res) => {
  const { initData, cart, customer } = req.body;
  const user = verifyTelegramInitData(initData);

  if (!user) {
    return res.status(401).json({ error: 'Telegram-подпись не прошла проверку' });
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Корзина пустая' });
  }

  const productIds = cart.map((item) => Number(item.productId)).filter(Boolean);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  const productMap = new Map(products.map((item) => [item.id, item]));

  const items = [];
  let totalAmount = 0;

  for (const rawItem of cart) {
    const product = productMap.get(Number(rawItem.productId));
    const quantity = Math.max(1, Number(rawItem.quantity || 1));
    if (!product) continue;

    const itemTotal = product.price * quantity;
    totalAmount += itemTotal;
    items.push({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity,
      size: rawItem.size ? String(rawItem.size) : null,
      imageUrl: product.imageUrl,
    });
  }

  if (items.length === 0) {
    return res.status(400).json({ error: 'Товары не найдены' });
  }

  const order = await prisma.order.create({
    data: {
      telegramId: String(user.id),
      username: user.username || null,
      fullName:
        customer?.fullName ||
        `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
        null,
      phone: customer?.phone || null,
      address: customer?.address || null,
      comment: customer?.comment || null,
      totalAmount,
      items: {
        create: items,
      },
    },
    include: { items: true },
  });

  const settings = await prisma.storeSetting.findUnique({ where: { id: 1 } });
  const currency = settings?.currency || config.currency;
  const lines = order.items.map(
    (item) =>
      `• ${item.title}${item.size ? ` [${item.size}]` : ''} × ${item.quantity} — ${money(item.price * item.quantity, currency)}`
  );

  const message = [
    '🛒 Новый заказ',
    `#${order.id}`,
    `Покупатель: ${order.fullName || 'Без имени'}${order.username ? ` (@${order.username})` : ''}`,
    `Телефон: ${order.phone || 'не указан'}`,
    `Адрес: ${order.address || 'не указан'}`,
    `Комментарий: ${order.comment || '—'}`,
    '',
    ...lines,
    '',
    `Итого: ${money(order.totalAmount, currency)}`,
  ].join('\n');

  const bot = getBot();
  if (bot && config.adminChatId) {
    try {
      await bot.telegram.sendMessage(config.adminChatId, message);
    } catch (error) {
      console.error('Failed to notify admin chat:', error.message);
    }
  }

  res.status(201).json({ orderId: order.id, message: 'Заказ принят' });
});

app.post('/api/admin/login', async (req, res) => {
  const { login, password } = req.body;
  const admin = await prisma.adminUser.findUnique({ where: { login } });

  if (!admin) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }

  res.json({ token: signAdminToken(admin) });
});

app.get('/api/admin/bootstrap', adminAuthMiddleware, async (_req, res) => {
  const [settings, products, orders] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { id: 1 } }),
    prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  res.json({ settings, products, orders });
});

app.put('/api/admin/settings', adminAuthMiddleware, async (req, res) => {
  const settings = await prisma.storeSetting.update({
    where: { id: 1 },
    data: {
      storeName: req.body.storeName,
      storeDescription: req.body.storeDescription,
      deliveryNote: req.body.deliveryNote,
      currency: req.body.currency,
      supportUsername: req.body.supportUsername || null,
      avatarUrl: req.body.avatarUrl || '/app/avatar.png',
    },
  });
  res.json(settings);
});

app.post('/api/admin/products', adminAuthMiddleware, async (req, res) => {
  const product = await prisma.product.create({
    data: {
      title: req.body.title,
      description: req.body.description || null,
      price: Number(req.body.price),
      imageUrl: req.body.imageUrl || '/app/avatar.png',
      category: req.body.category || null,
      sizes: Array.isArray(req.body.sizes) ? req.body.sizes : [],
      isActive: Boolean(req.body.isActive),
    },
  });
  res.status(201).json(product);
});

app.put('/api/admin/products/:id', adminAuthMiddleware, async (req, res) => {
  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: {
      title: req.body.title,
      description: req.body.description || null,
      price: Number(req.body.price),
      imageUrl: req.body.imageUrl || '/app/avatar.png',
      category: req.body.category || null,
      sizes: Array.isArray(req.body.sizes) ? req.body.sizes : [],
      isActive: Boolean(req.body.isActive),
    },
  });
  res.json(product);
});

app.delete('/api/admin/products/:id', adminAuthMiddleware, async (req, res) => {
  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

app.get('/api/admin/orders', adminAuthMiddleware, async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

app.put('/api/admin/orders/:id/status', adminAuthMiddleware, async (req, res) => {
  const order = await prisma.order.update({
    where: { id: Number(req.params.id) },
    data: { status: req.body.status },
    include: { items: true },
  });
  res.json(order);
});

app.get('/app', (_req, res) => {
  res.sendFile(path.join(publicDir, 'app', 'index.html'));
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(publicDir, 'admin', 'index.html'));
});

async function start() {
  await ensureAdminUser();
  await ensureStoreSettings();

  const PORT = process.env.PORT || 3000;

  const server = app.listen(PORT, async () => {
    console.log(`Server started on port ${PORT}`);
    try {
      await initBot();
    } catch (error) {
      console.error('Bot init failed:', error.message);
    }
  });

  process.on('SIGTERM', async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}

start().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
