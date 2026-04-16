import { Controller, Get, Post, Public, Roles, ValidateBody } from '#src/core/decorators/index.js';
import { FastifyRequest } from 'fastify';
import { InviteService } from './invite.service.js';
import { InvitePresenter } from './invite.presenter.js';
import { UserPresenter } from '../user/user.presenter.js';
import z from 'zod';

const createInviteSchema = z.object({
  firstName: z.string().max(100),
  lastName: z.string().max(100),
  institute: z.string().max(36),
  group: z.string(),
});
export type createInviteDto = z.infer<typeof createInviteSchema>;

const resolveInviteSchema = z.object({
  guid: z.string().max(36),
});
type resolveInviteDto = z.infer<typeof resolveInviteSchema>;

@Controller('/invite')
export class InviteController {
  private inviteService = new InviteService();

  @Post('/create')
  @ValidateBody(createInviteSchema)
  async create(request: FastifyRequest<{ Body: createInviteDto }>) {
    const invite = await this.inviteService.create(request.body, request.xamUser.id);
    return InvitePresenter.present(invite);
  }

  @Get('/pending')
  @Roles('admin')
  async getPending() {
    const invites = await this.inviteService.getPending();
    return InvitePresenter.presentManyAdmin(invites);
  }

  @Get('/')
  @Roles('admin')
  async getAll() {
    const invites = await this.inviteService.getAll();
    return InvitePresenter.presentManyAdmin(invites);
  }

  @Post('/approve')
  @Roles('admin')
  @ValidateBody(resolveInviteSchema)
  async approve(request: FastifyRequest<{ Body: resolveInviteDto }>) {
    const user = await this.inviteService.approve(request.body.guid);
    return UserPresenter.presentAdmin(user);
  }

  @Post('/reject')
  @Roles('admin')
  @ValidateBody(resolveInviteSchema)
  async reject(request: FastifyRequest<{ Body: resolveInviteDto }>) {
    const invite = await this.inviteService.reject(request.body.guid);
    return InvitePresenter.presentAdmin(invite);
  }
}
