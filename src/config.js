function getRequired(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export const config = {
  port: process.env.PORT || 8080,

  appUrl: getRequired('APP_URL'),
  botToken: getRequired('BOT_TOKEN'),
  databaseUrl: getRequired('DATABASE_URL'),
  jwtSecret: getRequired('JWT_SECRET'),

  adminLogin: getRequired('ADMIN_LOGIN'),
  adminPassword: getRequired('ADMIN_PASSWORD'),
  adminChatId: getRequired('ADMIN_CHAT_ID'),

  orderNotifyChatId: process.env.ORDER_NOTIFY_CHAT_ID || null,

  storeName: getRequired('STORE_NAME'),
  storeDescription: getRequired('STORE_DESCRIPTION'),
  deliveryNote: getRequired('DELIVERY_NOTE'),
  defaultCurrency: getRequired('DEFAULT_CURRENCY'),

  requireForProduction() {
    return true;
  },
};
