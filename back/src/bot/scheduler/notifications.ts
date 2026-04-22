import cron from 'node-cron';
import type { Bot as BotType } from '@maxhub/max-bot-api';
import { orm } from '#src/database/index.js';
import { Event } from '#src/modules/v1/event/event.entity.js';
import { formatDateRu, formatTimeRu, toMsk } from '../utils.js';

export class EventScheduler {
  private bot: BotType;

  constructor(bot: BotType) {
    this.bot = bot;
  }

  start() {
    // Каждый день в 7:00 МСК (4:00 UTC) — утренние уведомления
    cron.schedule('0 4 * * *', () => {
      this.sendMorningNotifications().catch(err =>
        console.error('Morning notifications error:', err),
      );
    });

    // Каждую минуту — проверка мероприятий через 30 минут
    cron.schedule('* * * * *', () => {
      this.sendReminderNotifications().catch(err =>
        console.error('Reminder notifications error:', err),
      );
    });

    console.log('Scheduler: cron jobs started');
  }

  async sendEventUpdate(guid: string) {
    const em = orm.em.fork();
    const event = await em.findOne(Event, { guid }, {
      populate: ['types', 'registrations.user'],
    });
    if (!event) return;

    const recipients = event.registrations.getItems()
      .filter(r => r.user.xamId && r.user.notifications)
      .map(r => r.user.xamId!);

    if (recipients.length === 0) return;

    const types = event.types.getItems().map(t => t.name).join(', ');
    const text = '📝 Мероприятие обновлено!\n\n'
      + `${event.title}\n`
      + `📅 ${formatDateRu(event.date)}\n`
      + `📍 ${event.location}\n`
      + `👥 Вместимость: ${event.capacity}`
      + (types ? `\n🏷 ${types}` : '')
      + `\n\n${event.description}`;

    await this.notifyUsers(recipients, text);
  }

  private async sendMorningNotifications() {
    const em = orm.em.fork();
    const now = new Date();
    const mskNow = toMsk(now);

    // Начало и конец сегодняшнего дня по МСК (в UTC)
    const dayStartMsk = new Date(Date.UTC(
      mskNow.getUTCFullYear(), mskNow.getUTCMonth(), mskNow.getUTCDate(), 0, 0, 0,
    ));
    const dayEndMsk = new Date(Date.UTC(
      mskNow.getUTCFullYear(), mskNow.getUTCMonth(), mskNow.getUTCDate(), 23, 59, 59,
    ));
    const dayStartUtc = new Date(dayStartMsk.getTime() - 3 * 60 * 60_000);
    const dayEndUtc = new Date(dayEndMsk.getTime() - 3 * 60 * 60_000);

    const events = await em.find(Event, {
      date: { $gte: dayStartUtc, $lte: dayEndUtc },
    }, { populate: ['registrations.user'] });

    for (const event of events) {
      const recipients = event.registrations.getItems()
        .filter(r => r.user.xamId && r.user.notifications)
        .map(r => r.user.xamId!);

      if (recipients.length === 0) continue;

      const text = '🌅 Сегодня состоится мероприятие!\n\n'
        + `${event.title}\n`
        + `⏰ Начало в ${formatTimeRu(event.date)}\n`
        + `📍 ${event.location}`;

      await this.notifyUsers(recipients, text);
    }
  }

  private async sendReminderNotifications() {
    const em = orm.em.fork();
    const now = new Date();
    const from = new Date(now.getTime() + 29 * 60_000);
    const to = new Date(now.getTime() + 31 * 60_000);

    const events = await em.find(Event, {
      date: { $gte: from, $lte: to },
    }, { populate: ['registrations.user'] });

    for (const event of events) {
      const recipients = event.registrations.getItems()
        .filter(r => r.user.xamId && r.user.notifications)
        .map(r => r.user.xamId!);

      if (recipients.length === 0) continue;

      const text = '⏰ Мероприятие начнётся через 30 минут!\n\n'
        + `${event.title}\n`
        + `📍 ${event.location}`;

      await this.notifyUsers(recipients, text);
    }
  }

  private async notifyUsers(xamIds: number[], text: string) {
    for (const xamId of xamIds) {
      try {
        await this.bot.api.sendMessageToUser(xamId, text);
      } catch (err) {
        console.error(`Failed to notify user ${xamId}:`, err);
      }
    }
  }
}
