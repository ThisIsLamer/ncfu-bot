import { orm } from '#src/database/index.js';
import { Institute } from './institute.entity.js';
import { User } from '../user/user.entity.js';

export class InstituteService {
  private get em() {
    return orm.em.fork();
  }

  async getAll() {
    return this.em.findAll(Institute);
  }

  async getUsers(guid: string, limit: number, offset: number) {
    const em = this.em;
    const institute = await em.findOneOrFail(Institute, { guid });
    const [users, total] = await em.findAndCount(
      User,
      { institute },
      { limit, offset, orderBy: { id: 'ASC' } },
    );
    return { users, total };
  }

  async create(data: { name: string }) {
    const em = this.em;
    const institute = em.create(Institute, { name: data.name });
    await em.flush();
    return institute;
  }

  async update(data: { guid: string; name?: string | undefined }) {
    const em = this.em;
    const institute = await em.findOneOrFail(Institute, { guid: data.guid });

    if (data.name !== undefined) institute.name = data.name;

    await em.flush();
    return institute;
  }

  async remove(guid: string) {
    const em = this.em;
    const institute = await em.findOneOrFail(Institute, { guid }, { populate: ['users'] });
    await em.remove(institute).flush();
  }
}
