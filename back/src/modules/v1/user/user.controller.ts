import { Controller, Delete, Get, InitDataOnly, Post, Roles, ValidateBody } from '#src/core/decorators/index.js';
import { FastifyRequest } from 'fastify';
import { UserService } from './user.service.js';
import { UserPresenter } from './user.presenter.js';
import { EventService } from '../event/event.service.js';
import { Rest } from '#src/core/examples.js';
import z from 'zod';

const createUserSchema = z.object({
  firstName: z.string().max(100),
  lastName: z.string().max(100),
  group: z.string().max(22),
  institute: z.string().max(36),
  role: z.string().max(16).optional(),
  avatarUrl: z.string().max(500).optional()
})
export type createUserDto = z.infer<typeof createUserSchema>

const updateUserSchema = z.object({
  guid: z.string().max(36),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  group: z.string().max(22).optional(),
  institute: z.string().max(36).optional(),
  role: z.string().max(16).optional(),
  avatarUrl: z.string().max(500).optional()
})
export type updateUserDto = z.infer<typeof updateUserSchema>

const removeUserSchema = z.object({
  guid: z.string().max(36)
})
type removeUserDto = z.infer<typeof removeUserSchema>

const registerSchema = z.object({
  guid: z.string().max(36),
});
type RegisterDto = z.infer<typeof registerSchema>;

@Controller('/users')
export class UserController {
  private userService = new UserService();
  private eventService = new EventService();

  @Get('/account')
  async getAccount(request: FastifyRequest) {
    const user = await this.userService.getByGuid(request.user.guid);
    return UserPresenter.present(user);
  }

  @Get('/stats')
  async getStats(request: FastifyRequest) {
    const attended = await this.eventService.getAttendedCount(request.user.guid);
    return { attended };
  }

  @Post('/notifications')
  @ValidateBody(z.object({ enabled: z.boolean() }))
  async updateNotifications(request: FastifyRequest<{ Body: { enabled: boolean } }>) {
    return this.userService.updateNotifications(request.user.guid, request.body.enabled);
  }

  @Post('/register')
  @InitDataOnly()
  @ValidateBody(registerSchema)
  async register(request: FastifyRequest<{ Body: RegisterDto }>) {
    const xamUser = request.xamUser;
    if (!xamUser?.id) {
      return Rest.error(request.method, 'Некорректные данные авторизации', 400);
    }

    const user = await this.userService.register(
      request.body.guid,
      xamUser.id,
      xamUser.photo_url,
    );
    return user;
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
