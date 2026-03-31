import crypto from 'node:crypto';
import { Telegraf, Markup } from 'telegraf';
import { config } from './config.js';

let bot;

function getMiniAppUrl() {
  return `${config.APP_URL.replace(/\/$/, '')}/app`;
}

export function getBot() {
  if (!bot) {
    bot = new Telegraf(config.BOT_TOKEN);
  }
  return bot;
}

export async function initBot() {
  const telegramBot = getBot();
  const miniAppUrl = getMiniAppUrl();

  telegramBot.start(async (ctx) => {
    await ctx.reply(
      'Добро пожаловать в Trendsetter Market 🔥',
      Markup.inlineKeyboard([
        [Markup.button.webApp('Открыть магазин', miniAppUrl)],
      ])
    );
  });

  telegramBot.command('help', async (ctx) => {
    await ctx.reply('Нажми кнопку ниже, чтобы открыть магазин.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Открыть магазин', web_app: { url: miniAppUrl } }],
        ],
      },
    });
  });

  await telegramBot.telegram.setChatMenuButton({
    menu_button: {
      type: 'web_app',
      text: 'Открыть магазин',
      web_app: { url: miniAppUrl },
    },
  });

  await telegramBot.launch();
  return telegramBot;
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
