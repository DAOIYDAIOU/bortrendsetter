import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const login = process.env.ADMIN_LOGIN || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'change_me';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { login },
    update: { passwordHash },
    create: { login, passwordHash },
  });

  await prisma.storeSetting.upsert({
    where: { id: 1 },
    update: {
      storeName: process.env.STORE_NAME || 'Trendsetter Market',
      storeDescription: process.env.STORE_DESCRIPTION || 'Стильные вещи и удобный заказ прямо в Telegram.',
      deliveryNote: process.env.DELIVERY_NOTE || 'Доставка по городу / отправка по стране.',
      currency: process.env.DEFAULT_CURRENCY || '₽',
      avatarUrl: '/app/avatar.png',
    },
    create: {
      id: 1,
      storeName: process.env.STORE_NAME || 'Trendsetter Market',
      storeDescription: process.env.STORE_DESCRIPTION || 'Стильные вещи и удобный заказ прямо в Telegram.',
      deliveryNote: process.env.DELIVERY_NOTE || 'Доставка по городу / отправка по стране.',
      currency: process.env.DEFAULT_CURRENCY || '₽',
      avatarUrl: '/app/avatar.png',
    },
  });

  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.createMany({
      data: [
        {
          title: 'Куртка Shadow Black',
          description: 'Теплая куртка с высоким воротом и мягкой подкладкой.',
          price: 11990,
          imageUrl: '/admin/avatar.png',
          category: 'Верхняя одежда',
          sizes: ['S', 'M', 'L', 'XL'],
          isActive: true,
        },
        {
          title: 'Кроссовки Street Force',
          description: 'Базовые кеды под любой образ.',
          price: 8990,
          imageUrl: '/admin/avatar.png',
          category: 'Обувь',
          sizes: ['40', '41', '42', '43', '44'],
          isActive: true,
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
