import crypto from 'node:crypto';
import { Telegraf, Markup } from 'telegraf';
import { config } from './config.js';

let botInstance = null;

function getMiniAppUrl() {
  return `${config.APP_URL.replace(/\/$/, '')}/app`;
}

export function getBot() {
  if (!botInstance) {
    botInstance = new Telegraf(config.BOT_TOKEN);
  }
  return botInstance;
}

export async function initBot() {
  const bot = getBot();
  const miniAppUrl = getMiniAppUrl();

  bot.start(async (ctx) => {
    await ctx.reply(
      'Добро пожаловать в Trendsetter Market 🔥',
      Markup.inlineKeyboard([
        [Markup.button.webApp('Открыть магазин', miniAppUrl)],
      ])
    );
  });

  bot.command('help', async (ctx) => {
    await ctx.reply(
      'Нажми кнопку ниже, чтобы открыть магазин.',
      Markup.inlineKeyboard([
        [Markup.button.webApp('Открыть магазин', miniAppUrl)],
      ])
    );
  });

  await bot.telegram.setChatMenuButton({
    menu_button: {
      type: 'web_app',
      text: 'Открыть магазин',
      web_app: { url: miniAppUrl },
    },
  });

  return bot;
}

export function verifyTelegramInitData(initData) {
  try {
    if (!initData || typeof initData !== 'string') return false;

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;

    params.delete('hash');

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.BOT_TOKEN)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch {
    return false;
  }
}
