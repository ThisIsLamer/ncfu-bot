import { orm } from '#src/database/index.js';
import { User } from './user.entity.js';
import { Institute } from '../institute/institute.entity.js';
import { AppError } from '#src/core/app-error.js';
import type { createUserDto, updateUserDto } from './user.controller.js';

export class UserService {
  private get em() {
    return orm.em.fork();
  }

  async getByGuid(guid: string) {
    return this.em.findOneOrFail(User, { guid }, { populate: ['institute'] });
  }

  async updateNotifications(guid: string, enabled: boolean) {
    const em = this.em;
    const user = await em.findOneOrFail(User, { guid });
    user.notifications = enabled;
    await em.flush();
    return { notifications: user.notifications };
  }

  async register(guid: string, xamId: number, avatarUrl?: string) {
    const em = this.em;
    const user = await em.findOneOrFail(User, { guid });

    if (user.xamId !== 0) {
      throw new AppError(409, 'Пользователь уже зарегистрирован');
    }

    const existing = await em.findOne(User, { xamId });
    if (existing) {
      throw new AppError(409, 'Этот Telegram-аккаунт уже привязан к другому пользователю');
    }

    user.xamId = xamId;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    await em.flush();
    return user;
  }

  async create(data: createUserDto) {
    const em = this.em;
    const institute = await em.findOneOrFail(Institute, { guid: data.institute });
    const user = em.create(User, {
      firstName: data.firstName,
      lastName: data.lastName,
      group: data.group,
      institute,
      role: data.role ?? 'user',
      avatarUrl: data.avatarUrl ?? null,
      xamId: 0
    });
    await em.flush();
    return user;
  }

  async update(data: updateUserDto) {
    const em = this.em;
    const user = await em.findOneOrFail(User, { guid: data.guid });

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.group !== undefined) user.group = data.group;
    if (data.role !== undefined) user.role = data.role;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;

    if (data.institute !== undefined) {
      user.institute = await em.findOneOrFail(Institute, { guid: data.institute });
    }

    await em.flush();
    return user;
  }

  async remove(guid: string) {
    const em = this.em;
    const user = await em.findOneOrFail(User, { guid });
    await em.remove(user).flush();
  }
}
