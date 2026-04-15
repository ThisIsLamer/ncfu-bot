import { Controller, Delete, Get, Post, Roles, ValidateBody } from '#src/core/decorators/index.js';
import { FastifyRequest } from 'fastify';
import { UserService } from './user.service.js';
import { UserPresenter } from './user.presenter.js';
import z from 'zod';

const createUserSchema = z.object({
  firstName: z.string().max(100),
  lastName: z.string().max(100),
  course: z.number(),
  institute: z.string().max(36),
  role: z.string().max(16).optional(),
  avatarUrl: z.string().max(500).optional()
})
export type createUserDto = z.infer<typeof createUserSchema>

const updateUserSchema = z.object({
  guid: z.string().max(36),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  course: z.number().optional(),
  institute: z.string().max(36).optional(),
  role: z.string().max(16).optional(),
  avatarUrl: z.string().max(500).optional()
})
export type updateUserDto = z.infer<typeof updateUserSchema>

const removeUserSchema = z.object({
  guid: z.string().max(36)
})
type removeUserDto = z.infer<typeof removeUserSchema>

@Controller('/')
export class UserController {
  private userService = new UserService();

  @Get('/account')
  async getAccount(request: FastifyRequest) {
    
  }

  @Post('/create')
  @Roles('admin')
  @ValidateBody(createUserSchema)
  async create(request: FastifyRequest<{ Body: createUserDto }>) {
    return await this.userService.create(request.body);
  }

  @Post('/update')
  @Roles('admin')
  @ValidateBody(updateUserSchema)
  async update(request: FastifyRequest<{ Body: updateUserDto }>) {
    return await this.userService.update(request.body);
  }

  @Delete('/')
  @Roles('admin')
  @ValidateBody(removeUserSchema)
  async remove(request: FastifyRequest<{ Body: removeUserDto }>) {
    return this.userService.remove(request.body.guid);
  }
}
