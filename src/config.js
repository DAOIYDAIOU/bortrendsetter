export function getRequired(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export const config = {
  APP_URL: getRequired('APP_URL'),
  BOT_TOKEN: getRequired('BOT_TOKEN'),
  DATABASE_URL: getRequired('DATABASE_URL'),
  JWT_SECRET: getRequired('JWT_SECRET'),
  ADMIN_LOGIN: getRequired('ADMIN_LOGIN'),
  ADMIN_PASSWORD: getRequired('ADMIN_PASSWORD'),
  ADMIN_CHAT_ID: getRequired('ADMIN_CHAT_ID'),
};
