import { Bot } from '@maxhub/max-bot-api';
import { handleStart } from './start.js';
import { handleEvents } from './events.js';

export function registerHandlers(bot: Bot) {
  handleStart(bot);
  handleEvents(bot);
}
