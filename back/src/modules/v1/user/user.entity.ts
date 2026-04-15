import { Entity, ManyToOne, Property } from '@mikro-orm/decorators/es';
import { randomUUID } from 'crypto';
import { BaseEntity } from '#src/database/base.entity.js';
import { Institute } from '../institute/institute.entity.js';

@Entity()
export class User extends BaseEntity<'guid' | 'avatarUrl' | 'theme'> {
  @Property({ type: 'string', length: 36, unique: true, onCreate: () => randomUUID() })
  guid: string = randomUUID();

  @Property({ type: 'string', length: 100 })
  firstName!: string;

  @Property({ type: 'string', length: 100 })
  lastName!: string;

  @ManyToOne(() => Institute)
  institute!: Institute;

  @Property({ type: 'tinyint' })
  course!: number;

  @Property({ type: 'string', length: 16, default: 'user' })
  role!: string;

  @Property({ type: 'string', length: 500, nullable: true })
  avatarUrl: string | null = null;

  @Property({ type: 'string', length: 8, default: 'dark' })
  theme: string = 'dark';
}
