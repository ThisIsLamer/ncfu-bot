import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/decorators/es';
import { randomUUID } from 'crypto';
import { BaseEntity } from '#src/database/base.entity.js';
import { Event } from './event.entity.js';
import { User } from '../user/user.entity.js';

@Entity()
@Unique({ properties: ['event', 'user'] })
export class EventRegistration extends BaseEntity<'guid'> {
  @Property({ type: 'string', length: 36, unique: true, onCreate: () => randomUUID() })
  guid: string = randomUUID();

  @ManyToOne(() => Event)
  event!: Event;

  @ManyToOne(() => User)
  user!: User;
}
