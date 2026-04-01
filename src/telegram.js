import { Telegraf } from 'telegraf';
import { config } from './config.js';

let bot;

export function initBot() {
  bot = new Telegraf(config.botToken);

  bot.start(async (ctx) => {
    const isAdmin = String(ctx.from.id) === String(config.adminChatId);

    await ctx.reply(
      `Добро пожаловать в ${config.storeName}`,
      {
        reply_markup: {
          keyboard: [
            [{ text: 'Магазин', web_app: { url: config.appUrl + '/app' } }],
            ...(isAdmin
              ? [[{ text: 'Админка', web_app: { url: config.appUrl + '/admin' } }]]
              : []),
          ],
          resize_keyboard: true,
        },
      }
    );
  });

  bot.launch();
}

export function getBot() {
  return bot;
}

export function verifyTelegramInitData() {
  return { id: 1 };
}
