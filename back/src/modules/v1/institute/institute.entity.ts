import { Cascade, Collection } from '@mikro-orm/core';
import { Entity, OneToMany, Property } from '@mikro-orm/decorators/es';
import { randomUUID } from 'crypto';
import { BaseEntity } from '#src/database/base.entity.js';
import type { User } from '../user/user.entity.js';

@Entity()
export class Institute extends BaseEntity<'guid'> {
  @Property({ type: 'string', length: 36, unique: true, onCreate: () => randomUUID() })
  guid: string = randomUUID();

  @Property({ type: 'string', length: 255, unique: true })
  name!: string;

  @OneToMany('User', 'institute', { cascade: [Cascade.REMOVE], orphanRemoval: true })
  users = new Collection<User>(this);
}
