import { Event } from './event.entity.js';

export interface EventPresented {
  guid: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  registered: number;
  color: string;
  types: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EventPresentedAdmin extends EventPresented {
  id: number;
}

export class EventPresenter {
  static present(event: Event): EventPresented {
    return {
      guid: event.guid,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      capacity: event.capacity,
      registered: event.registrations.length,
      color: event.color,
      types: event.types.getItems().map(t => t.name),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  static presentMany(events: Event[]): EventPresented[] {
    return events.map(e => EventPresenter.present(e));
  }
}
