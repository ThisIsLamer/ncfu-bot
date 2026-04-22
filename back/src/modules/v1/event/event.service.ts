import { orm } from '#src/database/index.js';
import { Event } from './event.entity.js';
import { EventType } from './event-type.entity.js';
import { EventRegistration } from './event-registration.entity.js';
import { User } from '../user/user.entity.js';
import { AppError } from '#src/core/app-error.js';
import { getScheduler } from '#src/bot/index.js';
import type { createEventDto, updateEventDto } from './event.controller.js';

export class EventService {
  private get em() {
    return orm.em.fork();
  }

  async getOne(guid: string) {
    const em = this.em;
    return em.findOneOrFail(Event, { guid }, { populate: ['types', 'registrations'] });
  }

  async get(search?: string, filter?: string[]) {
    const qb = this.em.createQueryBuilder(Event, 'e')
      .leftJoinAndSelect('e.types', 't')
      .leftJoinAndSelect('e.registrations', 'r');

    if (search) {
      qb.andWhere({
        $or: [
          { title: { $like: `%${search}%` } },
          { description: { $like: `%${search}%` } },
        ],
      });
    }

    if (filter && filter.length > 0) {
      qb.andWhere({ types: { name: { $in: filter } } });
    }

    return qb.getResultList();
  }

  async getTypes() {
    return this.em.findAll(EventType);
  }

  async createType(name: string) {
    const em = this.em;
    const type = em.create(EventType, { name });
    await em.flush();
    return type;
  }

  async updateType(guid: string, name: string) {
    const em = this.em;
    const type = await em.findOneOrFail(EventType, { guid });
    type.name = name;
    await em.flush();
    return type;
  }

  async removeType(guid: string) {
    const em = this.em;
    const type = await em.findOneOrFail(EventType, { guid });
    await em.remove(type).flush();
  }

  async getByUser(userGuid: string): Promise<Event[]> {
    const em = this.em;
    const registrations = await em.find(EventRegistration, { user: { guid: userGuid } }, {
      populate: ['event.types', 'event.registrations'],
    });
    return registrations.map(r => r.event);
  }

  async register(guidEvent: string, userGuid: string) {
    const em = this.em;
    const event = await em.findOneOrFail(Event, { guid: guidEvent }, { populate: ['registrations'] });
    const user = await em.findOneOrFail(User, { guid: userGuid });

    if (event.registrations.length >= event.capacity) {
      throw new AppError(409, 'Мероприятие заполнено');
    }

    const existing = await em.findOne(EventRegistration, { event, user });
    if (existing) {
      throw new AppError(409, 'Вы уже зарегистрированы');
    }

    const registration = em.create(EventRegistration, { event, user });
    await em.flush();
    return { guid: registration.guid };
  }

  async markAttended(registrationGuid: string) {
    const em = this.em;
    const reg = await em.findOneOrFail(EventRegistration, { guid: registrationGuid });
    reg.attended = true;
    await em.flush();
    return { success: true };
  }

  async getAttendedCount(userGuid: string): Promise<number> {
    return this.em.count(EventRegistration, {
      user: { guid: userGuid },
      attended: true,
    });
  }

  async getRegistration(guidEvent: string, userGuid: string) {
    const em = this.em;
    const registration = await em.findOne(EventRegistration, {
      event: { guid: guidEvent },
      user: { guid: userGuid },
    });
    return registration ? { guid: registration.guid } : null;
  }

  async create(data: createEventDto) {
    const em = this.em;
    const eventTypes = await em.find(EventType, { name: { $in: data.types } });
    const event = em.create(Event, {
      title: data.title,
      description: data.description,
      date: data.date,
      location: data.location,
      capacity: data.capacity,
      color: data.colors,
      types: eventTypes,
    });
    await em.flush();
    return event;
  }

  async update(data: updateEventDto) {
    const em = this.em;
    const event = await em.findOneOrFail(Event, { guid: data.guid }, { populate: ['types'] });

    if (data.title !== undefined) event.title = data.title;
    if (data.description !== undefined) event.description = data.description;
    if (data.date !== undefined) event.date = data.date;
    if (data.location !== undefined) event.location = data.location;
    if (data.capacity !== undefined) event.capacity = data.capacity;
    if (data.colors !== undefined) event.color = data.colors;

    if (data.types !== undefined) {
      const eventTypes = await em.find(EventType, { name: { $in: data.types } });
      event.types.set(eventTypes);
    }

    await em.flush();

    const scheduler = getScheduler();
    if (scheduler) {
      await scheduler.sendEventUpdate(event.guid);
    }

    return event;
  }

  async remove(guid: string) {
    const em = this.em;
    const event = await em.findOneOrFail(Event, { guid });
    await em.remove(event).flush();
  }

  async getStats() {
    const em = this.em;
    const events = await em.findAll(Event, { populate: ['registrations', 'types'] });
    const totalUsers = await em.count(User);
    const totalRegistrations = await em.count(EventRegistration);
    const totalAttended = await em.count(EventRegistration, { attended: true });

    const eventStats = events.map(e => {
      const registered = e.registrations.length;
      const attended = e.registrations.getItems().filter(r => r.attended).length;
      return {
        guid: e.guid,
        title: e.title,
        date: e.date,
        capacity: e.capacity,
        registered,
        attended,
        fillRate: e.capacity > 0 ? Math.round((registered / e.capacity) * 100) : 0,
        attendRate: registered > 0 ? Math.round((attended / registered) * 100) : 0,
        types: e.types.getItems().map(t => t.name),
      };
    });

    // Распределение по типам
    const typeMap = new Map<string, number>();
    for (const e of events) {
      for (const t of e.types.getItems()) {
        typeMap.set(t.name, (typeMap.get(t.name) || 0) + 1);
      }
    }
    const byType = Array.from(typeMap.entries()).map(([name, count]) => ({ name, count }));

    return {
      totalEvents: events.length,
      totalUsers,
      totalRegistrations,
      totalAttended,
      attendanceRate: totalRegistrations > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0,
      events: eventStats,
      byType,
    };
  }
}
