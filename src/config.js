function getRequired(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export const config = {
  appUrl: getRequired('APP_URL'),
  botToken: getRequired('BOT_TOKEN'),
  databaseUrl: getRequired('DATABASE_URL'),
  jwtSecret: getRequired('JWT_SECRET'),

  adminLogin: getRequired('ADMIN_LOGIN'),
  adminPassword: getRequired('ADMIN_PASSWORD'),
  adminChatId: getRequired('ADMIN_CHAT_ID'),

  storeName: getRequired('STORE_NAME'),
  storeDescription: getRequired('STORE_DESCRIPTION'),
  deliveryNote: getRequired('DELIVERY_NOTE'),
  currency: getRequired('DEFAULT_CURRENCY'),

  requireForProduction() {
    getRequired('APP_URL');
    getRequired('BOT_TOKEN');
    getRequired('DATABASE_URL');
    getRequired('JWT_SECRET');
    getRequired('ADMIN_LOGIN');
    getRequired('ADMIN_PASSWORD');
    getRequired('ADMIN_CHAT_ID');
    getRequired('STORE_NAME');
    getRequired('STORE_DESCRIPTION');
    getRequired('DELIVERY_NOTE');
    getRequired('DEFAULT_CURRENCY');
  },
};
