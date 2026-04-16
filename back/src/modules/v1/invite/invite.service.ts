import { orm } from '#src/database/index.js';
import { Invite, InviteStatus } from './invite.entity.js';
import { User } from '../user/user.entity.js';
import { Institute } from '../institute/institute.entity.js';
import type { createInviteDto } from './invite.controller.js';

export class InviteService {
  private get em() {
    return orm.em.fork();
  }

  async create(data: createInviteDto, xamId: number) {
    const em = this.em;

    const existingUser = await em.findOne(User, { xamId: xamId });
    if (existingUser) {
      throw new Error('User already registered');
    }

    const existingInvite = await em.findOne(Invite, {
      xamId,
      status: InviteStatus.PENDING,
    });
    if (existingInvite) {
      throw new Error('Invite already pending');
    }

    const institute = await em.findOneOrFail(Institute, { guid: data.institute });
    const invite = em.create(Invite, {
      xamId,
      firstName: data.firstName,
      lastName: data.lastName,
      institute,
      group: data.group,
    });
    await em.flush();
    return invite;
  }

  async getAll() {
    return this.em.findAll(Invite, { populate: ['institute'] });
  }

  async getPending() {
    return this.em.find(Invite, { status: InviteStatus.PENDING }, { populate: ['institute'] });
  }

  async approve(guid: string): Promise<User> {
    const em = this.em;
    const invite = await em.findOneOrFail(Invite, { guid }, { populate: ['institute'] });

    if (invite.status !== InviteStatus.PENDING) {
      throw new Error('Invite is not pending');
    }

    invite.status = InviteStatus.APPROVED;

    const user = em.create(User, {
      xamId: invite.xamId,
      firstName: invite.firstName,
      lastName: invite.lastName,
      institute: invite.institute,
      group: invite.group,
    });

    await em.flush();
    return user;
  }

  async reject(guid: string) {
    const em = this.em;
    const invite = await em.findOneOrFail(Invite, { guid });

    if (invite.status !== InviteStatus.PENDING) {
      throw new Error('Invite is not pending');
    }

    invite.status = InviteStatus.REJECTED;
    await em.flush();
    return invite;
  }
}
