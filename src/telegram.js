import crypto from 'crypto';
import { Telegraf, Markup } from 'telegraf';
import { config } from './config.js';

let bot;

export function getBot() {
  if (!config.botToken) return null;
  if (!bot) {
    bot = new Telegraf(config.botToken);

    bot.start(async (ctx) => {
      await ctx.reply(
        'Добро пожаловать в Trendsetter Market. Нажми кнопку ниже, чтобы открыть магазин прямо внутри Telegram.',
        Markup.inlineKeyboard([
          [Markup.button.webApp('Открыть магазин', `${config.appUrl}/app`)],
        ]),
      );
    });

    bot.command('help', async (ctx) => {
      await ctx.reply('Открой мини-апп через кнопку меню или по кнопке магазина.');
    });
  }
  return bot;
}

export async function initBot() {
  const instance = getBot();
  if (!instance) {
    console.warn('BOT_TOKEN is missing. Bot disabled.');
    return null;
  }

  await instance.telegram.setMyCommands([
    { command: 'start', description: 'Запустить бота' },
    { command: 'help', description: 'Помощь' },
  ]);

  if (config.appUrl) {
    await instance.telegram.setChatMenuButton({
      menu_button: {
        type: 'web_app',
        text: 'Магазин',
        web_app: { url: `${config.appUrl}/app` },
      },
    });
  }

  await instance.launch();
  console.log('Telegram bot launched');

  process.once('SIGINT', () => instance.stop('SIGINT'));
  process.once('SIGTERM', () => instance.stop('SIGTERM'));

  return instance;
}

export function verifyTelegramInitData(initData) {
  if (!initData || !config.botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(config.botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculatedHash !== hash) return null;

  const userRaw = params.get('user');
  if (!userRaw) return null;

  try {
    return JSON.parse(userRaw);
  } catch {
    return null;
  }
}
