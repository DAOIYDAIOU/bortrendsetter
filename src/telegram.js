import { Telegraf } from 'telegraf';
import { config } from './config.js';

let bot;

export async function initBot() {
  bot = new Telegraf(config.botToken);

  bot.start(async (ctx) => {
    const isAdmin = String(ctx.from.id) === String(config.adminChatId);

    await ctx.reply(
      `Добро пожаловать в ${config.storeName} 🔥`,
      {
        reply_markup: {
          keyboard: [
            [{ text: '🛍 Магазин', web_app: { url: `${config.appUrl}/app` } }],
            ...(isAdmin
              ? [[{ text: '⚙️ Админка', web_app: { url: `${config.appUrl}/admin` } }]]
              : []),
          ],
          resize_keyboard: true,
        },
      }
    );
  });

  bot.catch((err) => {
    console.error('Telegram bot error:', err.message);
  });

  try {
    await bot.launch();
    console.log('Bot started');
  } catch (error) {
    console.error('Bot launch failed:', error.message);
  }
}

export function getBot() {
  return bot;
}

export function verifyTelegramInitData() {
  return { id: 1 };
}
