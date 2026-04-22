import { Bot } from '@maxhub/max-bot-api';

export function handleStart(bot: Bot) {
  bot.on('bot_started', async (ctx) => {
    await ctx.reply(
      'Добро пожаловать в NCFU Events!\n\n'
      + 'Это приложение для учёта мероприятий и посещаемости университета СКФУ.\n\n'
      + 'Команды:\n'
      + '/events — ваши предстоящие мероприятия',
    );
  });

  bot.command('start', async (ctx) => {
    await ctx.reply(
      'NCFU Events — учёт мероприятий СКФУ\n\n'
      + 'Команды:\n'
      + '/events — ваши предстоящие мероприятия',
    );
  });
}
