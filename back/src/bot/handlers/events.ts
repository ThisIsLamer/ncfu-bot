import { Bot } from '@maxhub/max-bot-api';
import { orm } from '#src/database/index.js';
import { User } from '#src/modules/v1/user/user.entity.js';
import { EventRegistration } from '#src/modules/v1/event/event-registration.entity.js';
import { formatDateRu } from '../utils.js';

export function handleEvents(bot: Bot) {
  bot.command('events', async (ctx) => {
    const xamId = (ctx.user as { user_id: number } | undefined)?.user_id;
    if (!xamId) {
      await ctx.reply('Не удалось определить пользователя.');
      return;
    }

    const em = orm.em.fork();
    const user = await em.findOne(User, { xamId });

    if (!user) {
      await ctx.reply('Вы ещё не зарегистрированы в системе.\nОткройте приложение и отсканируйте QR-код.');
      return;
    }

    const registrations = await em.find(
      EventRegistration,
      { user },
      { populate: ['event.types', 'event.registrations'], orderBy: { event: { date: 'ASC' } } },
    );

    const now = new Date();
    const upcoming = registrations.filter(r => r.event.date >= now);

    if (upcoming.length === 0) {
      await ctx.reply('У вас нет предстоящих мероприятий.');
      return;
    }

    const lines = upcoming.map((r, i) => {
      const e = r.event;
      const types = e.types.getItems().map(t => t.name).join(', ');
      const status = r.attended ? '✅' : '⏳';
      return `${i + 1}. ${status} ${e.title}\n   📅 ${formatDateRu(e.date)}\n   📍 ${e.location}${types ? `\n   🏷 ${types}` : ''}`;
    });

    await ctx.reply(`Ваши предстоящие мероприятия (${upcoming.length}):\n\n${lines.join('\n\n')}`);
  });
}
