import { Entity, ManyToMany, OneToMany, Property } from '@mikro-orm/decorators/es';
import { Cascade, Collection } from '@mikro-orm/core';
import { randomUUID } from 'crypto';
import { BaseEntity } from '#src/database/base.entity.js';
import { EventType } from './event-type.entity.js';
import { EventRegistration } from './event-registration.entity.js';

@Entity()
export class Event extends BaseEntity<'guid'> {
  @Property({ type: 'string', length: 36, unique: true, onCreate: () => randomUUID() })
  guid: string = randomUUID();

  @Property({ type: 'string', length: 255 })
  title!: string;

  @Property({ type: 'string', length: 2000 })
  description!: string;

  @Property({ type: 'datetime' })
  date!: Date;

  @Property({ type: 'string', length: 255 })
  location!: string;

  @Property({ type: 'integer' })
  capacity!: number;

  @Property({ type: 'string', length: 7 })
  color!: string;

  @ManyToMany({ entity: () => EventType })
  types = new Collection<EventType>(this);

  @OneToMany(() => EventRegistration, (r) => r.event, { cascade: [Cascade.REMOVE], orphanRemoval: true })
  registrations = new Collection<EventRegistration>(this);
}
