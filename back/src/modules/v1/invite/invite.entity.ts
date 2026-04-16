import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/decorators/es';
import { randomUUID } from 'crypto';
import { BaseEntity } from '#src/database/base.entity.js';
import { Institute } from '../institute/institute.entity.js';

export enum InviteStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class Invite extends BaseEntity<'guid' | 'status'> {
  @Property({ type: 'string', length: 36, unique: true, onCreate: () => randomUUID() })
  guid: string = randomUUID();

  @Property({ type: 'int' })
  xamId!: number;

  @Property({ type: 'string', length: 100 })
  firstName!: string;

  @Property({ type: 'string', length: 100 })
  lastName!: string;

  @ManyToOne(() => Institute)
  institute!: Institute;

  @Property({ type: 'string', length: 22 })
  group!: string;

  @Enum({ items: () => InviteStatus, default: InviteStatus.PENDING })
  status: InviteStatus = InviteStatus.PENDING;
}
