export function getRequired(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export const config = {
  get APP_URL() {
    return getRequired('APP_URL');
  },
  get BOT_TOKEN() {
    return getRequired('BOT_TOKEN');
  },
  get DATABASE_URL() {
    return getRequired('DATABASE_URL');
  },
  get JWT_SECRET() {
    return getRequired('JWT_SECRET');
  },
  get ADMIN_LOGIN() {
    return getRequired('ADMIN_LOGIN');
  },
  get ADMIN_PASSWORD() {
    return getRequired('ADMIN_PASSWORD');
  },
  get ADMIN_CHAT_ID() {
    return getRequired('ADMIN_CHAT_ID');
  },
  requireForProduction() {
    getRequired('APP_URL');
    getRequired('BOT_TOKEN');
    getRequired('DATABASE_URL');
    getRequired('JWT_SECRET');
    getRequired('ADMIN_LOGIN');
    getRequired('ADMIN_PASSWORD');
    getRequired('ADMIN_CHAT_ID');
  },
};
