import { Bot } from '@maxhub/max-bot-api';
import type { Bot as BotType } from '@maxhub/max-bot-api';
import { GLOBAL_CONFIG } from '#src/config.js';
import { registerHandlers } from './handlers/index.js';
import { EventScheduler } from './scheduler/notifications.js';

let bot: BotType;
let scheduler: EventScheduler;

export function getBot(): BotType {
  return bot;
}

export function getScheduler(): EventScheduler {
  return scheduler;
}

export async function startBot() {
  bot = new Bot(GLOBAL_CONFIG.APP.BOT_TOKEN);

  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  await bot.api.setMyCommands([
    { name: 'start', description: 'Начать работу с ботом' },
    { name: 'events', description: 'Мои мероприятия' },
  ]);

  registerHandlers(bot);

  scheduler = new EventScheduler(bot);
  scheduler.start();

  bot.start();
  console.log('Bot started');
}
