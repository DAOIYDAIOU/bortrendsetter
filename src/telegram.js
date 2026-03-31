import { Telegraf } from 'telegraf';
import { config } from './config.js';

const bot = new Telegraf(config.BOT_TOKEN);

const miniAppUrl = `${config.APP_URL}/app`;

export async function startTelegram() {
  // Кнопка меню (внизу Telegram)
  await bot.telegram.setChatMenuButton({
    menu_button: {
      type: 'web_app',
      text: 'Открыть магазин',
      web_app: { url: miniAppUrl },
    },
  });

  // /start команда
  bot.start(async (ctx) => {
    await ctx.reply(
      'Добро пожаловать в магазин 🔥',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Открыть магазин',
                web_app: { url: miniAppUrl },
              },
            ],
          ],
        },
      }
    );
  });

  bot.launch();
}
