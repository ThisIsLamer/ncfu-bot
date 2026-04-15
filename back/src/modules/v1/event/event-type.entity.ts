import { Entity, Property } from '@mikro-orm/decorators/es';
import { randomUUID } from 'crypto';
import { BaseEntity } from '#src/database/base.entity.js';

@Entity()
export class EventType extends BaseEntity<'guid'> {
  @Property({ type: 'string', length: 36, unique: true, onCreate: () => randomUUID() })
  guid: string = randomUUID();

  @Property({ type: 'string', length: 100, unique: true })
  name!: string;
}
