import dotenv from 'dotenv';
dotenv.config();

function getRequired(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT || 3000),
  appUrl: process.env.APP_URL || '',
  botToken: process.env.BOT_TOKEN || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  databaseUrl: process.env.DATABASE_URL || '',
  adminLogin: process.env.ADMIN_LOGIN || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'change_me',
  adminChatId: process.env.ADMIN_CHAT_ID || '',
  storeName: process.env.STORE_NAME || 'Trendsetter Market',
  storeDescription: process.env.STORE_DESCRIPTION || 'Стильные вещи и удобный заказ прямо в Telegram.',
  deliveryNote: process.env.DELIVERY_NOTE || 'Доставка по городу / отправка по стране.',
  defaultCurrency: process.env.DEFAULT_CURRENCY || '₽',
  requireForProduction() {
    if (process.env.NODE_ENV === 'production') {
      getRequired('APP_URL');
      getRequired('BOT_TOKEN');
      getRequired('JWT_SECRET');
      getRequired('DATABASE_URL');
    }
  },
};
