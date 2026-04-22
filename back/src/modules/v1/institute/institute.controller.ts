import { Controller, Delete, Get, Post, Public, Roles, ValidateBody, ValidateQuery } from '#src/core/decorators/index.js';
import { FastifyRequest } from 'fastify';
import { InstituteService } from './institute.service.js';
import { InstitutePresenter } from './institute.presenter.js';
import { UserPresenter } from '../user/user.presenter.js';
import z from 'zod';

const createInstituteSchema = z.object({
  name: z.string().max(255),
});
type CreateInstituteDto = z.infer<typeof createInstituteSchema>;

const updateInstituteSchema = z.object({
  guid: z.string().max(36),
  name: z.string().max(255).optional(),
});
type UpdateInstituteDto = z.infer<typeof updateInstituteSchema>;

const removeInstituteSchema = z.object({
  guid: z.string().max(36),
});
type RemoveInstituteDto = z.infer<typeof removeInstituteSchema>;

const getUsersQuerySchema = z.object({
  guid: z.string().max(36),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;

@Controller('/institutes')
export class InstituteController {
  private instituteService = new InstituteService();

  @Get('/')
  @Public()
  async getAll() {
    const institutes = await this.instituteService.getAll();
    return InstitutePresenter.presentMany(institutes);
  }

  @Get('/users')
  @Roles('admin')
  @ValidateQuery(getUsersQuerySchema)
  async getUsers(request: FastifyRequest<{ Querystring: GetUsersQuery }>) {
    const { guid, limit, offset } = request.query;
    const { users, total } = await this.instituteService.getUsers(guid, limit, offset);
    return { users: UserPresenter.presentMany(users), total, limit, offset };
  }

  @Post('/create')
  @Roles('admin')
  @ValidateBody(createInstituteSchema)
  async create(request: FastifyRequest<{ Body: CreateInstituteDto }>) {
    return await this.instituteService.create(request.body);
  }

  @Post('/update')
  @Roles('admin')
  @ValidateBody(updateInstituteSchema)
  async update(request: FastifyRequest<{ Body: UpdateInstituteDto }>) {
    return  await this.instituteService.update(request.body);
  }

  @Delete('/')
  @Roles('admin')
  @ValidateBody(removeInstituteSchema)
  async remove(request: FastifyRequest<{ Body: RemoveInstituteDto }>) {
    return this.instituteService.remove(request.body.guid);
  }
}
