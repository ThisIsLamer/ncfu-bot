import { Controller, Delete, Get, Post, Public, Roles, ValidateBody } from '#src/core/decorators/index.js';
import { FastifyRequest } from 'fastify';
import { InstituteService } from './institute.service.js';
import { InstitutePresenter } from './institute.presenter.js';
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

@Controller('/institutes')
export class InstituteController {
  private instituteService = new InstituteService();

  @Get('/')
  @Public()
  async getAll() {
    const institutes = await this.instituteService.getAll();
    return InstitutePresenter.presentMany(institutes);
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
