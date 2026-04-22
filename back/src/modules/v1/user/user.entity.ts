import { Entity, ManyToOne, Property } from '@mikro-orm/decorators/es';
import { randomUUID } from 'crypto';
import { BaseEntity } from '#src/database/base.entity.js';
import { Institute } from '../institute/institute.entity.js';

@Entity()
export class User extends BaseEntity<'guid' | 'xamId' | 'avatarUrl' | 'theme' | 'role' | 'notifications'> {
  @Property({ type: 'string', length: 36, unique: true, onCreate: () => randomUUID() })
  guid: string = randomUUID();

  @Property({ type: 'int', unique: true, nullable: true })
  xamId: number | null = null;

  @Property({ type: 'string', length: 100 })
  firstName!: string;

  @Property({ type: 'string', length: 100 })
  lastName!: string;

  @ManyToOne(() => Institute)
  institute!: Institute;

  @Property({ type: 'string', length: 22 })
  group!: string;

  @Property({ type: 'string', length: 16, default: 'user' })
  role!: string;

  @Property({ type: 'string', length: 500, nullable: true })
  avatarUrl: string | null = null;

  @Property({ type: 'string', length: 8, default: 'dark' })
  theme: string = 'dark';

  @Property({ type: 'boolean', default: true })
  notifications: boolean = true;
}
