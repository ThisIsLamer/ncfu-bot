import { orm } from '#src/database/index.js';
import { Event } from './event.entity.js';
import { EventType } from './event-type.entity.js';
import { EventRegistration } from './event-registration.entity.js';
import { User } from '../user/user.entity.js';
import type { createEventDto, updateEventDto } from './event.controller.js';

export class EventService {
  private get em() {
    return orm.em.fork();
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
      throw new Error('Event is full');
    }

    const existing = await em.findOne(EventRegistration, { event, user });
    if (existing) {
      throw new Error('User already registered');
    }

    const registration = em.create(EventRegistration, { event, user });
    await em.flush();
    return registration;
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
    return event;
  }

  async remove(guid: string) {
    const em = this.em;
    const event = await em.findOneOrFail(Event, { guid });
    await em.remove(event).flush();
  }
}
