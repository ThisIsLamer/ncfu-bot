import { orm } from '#src/database/index.js';
import { User } from './user.entity.js';
import { Institute } from '../institute/institute.entity.js';
import type { createUserDto, updateUserDto } from './user.controller.js';

export class UserService {
  private get em() {
    return orm.em.fork();
  }

  async create(data: createUserDto) {
    const em = this.em;
    const institute = await em.findOneOrFail(Institute, { guid: data.institute });
    const user = em.create(User, {
      firstName: data.firstName,
      lastName: data.lastName,
      course: data.course,
      institute,
      role: data.role ?? 'user',
      avatarUrl: data.avatarUrl ?? null,
    });
    await em.flush();
    return user;
  }

  async update(data: updateUserDto) {
    const em = this.em;
    const user = await em.findOneOrFail(User, { guid: data.guid });

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.course !== undefined) user.course = data.course;
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
