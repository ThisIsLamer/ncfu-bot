import { Controller, Delete, Get, Post, Roles, ValidateBody, ValidateQuery } from '#src/core/decorators/index.js';
import z from 'zod';
import { EventService } from './event.service.js';
import { EventPresenter } from './event.presenter.js';
import { FastifyRequest } from 'fastify';

const getOneEventSchema = z.object({
  guid: z.string().max(36),
});
type GetOneEventDto = z.infer<typeof getOneEventSchema>;

const getEventsSchema = z.object({
  search: z.string().optional(),
  filter: z.array(z.string()).optional(),
});
type GetEventDto = z.infer<typeof getEventsSchema>;

const checkRegistrationSchema = z.object({
  guidEvent: z.string().max(36),
});
type CheckRegistrationDto = z.infer<typeof checkRegistrationSchema>;

const registerEventSchema = z.object({
  guidEvent: z.string().max(36)
})
type registerEventDto = z.infer<typeof registerEventSchema>

const createEventSchema = z.object({
  title: z.string().max(255),
  description: z.string().max(2000),
  date: z.coerce.date(),
  location: z.string().max(255),
  capacity: z.number(),
  colors: z.string().max(7),
  types: z.array(z.string())
})
export type createEventDto = z.infer<typeof createEventSchema>

const updateEventSchema = z.object({
  guid: z.string().max(36),
  title: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  date: z.coerce.date().optional(),
  location: z.string().max(255).optional(),
  capacity: z.number().optional(),
  colors: z.string().max(7).optional(),
  types: z.array(z.string()).optional()
})
export type updateEventDto = z.infer<typeof updateEventSchema>

const deleteEventSchema = z.object({
  guid: z.string().max(36)
})
type deleteEventDto = z.infer<typeof deleteEventSchema>

@Controller('/events')
export class EventController {
  private eventService = new EventService();

  @Get('/')
  @ValidateQuery(getEventsSchema)
  async get(request: FastifyRequest<{ Querystring: GetEventDto }>) {
    const { search, filter } = request.query;
    const events = await this.eventService.get(search, filter);
    return EventPresenter.presentMany(events);
  }

  @Get('/one')
  @ValidateQuery(getOneEventSchema)
  async getOne(request: FastifyRequest<{ Querystring: GetOneEventDto }>) {
    const event = await this.eventService.getOne(request.query.guid);
    return EventPresenter.present(event);
  }

  @Get('/types')
  async getTypes() {
    return this.eventService.getTypes();
  }

  @Get('/stats')
  @Roles('organizer', 'admin')
  async getStats() {
    return this.eventService.getStats();
  }

  @Post('/types/create')
  @Roles('admin')
  @ValidateBody(z.object({ name: z.string().max(100) }))
  async createType(request: FastifyRequest<{ Body: { name: string } }>) {
    return this.eventService.createType(request.body.name);
  }

  @Post('/types/update')
  @Roles('admin')
  @ValidateBody(z.object({ guid: z.string().max(36), name: z.string().max(100) }))
  async updateType(request: FastifyRequest<{ Body: { guid: string; name: string } }>) {
    return this.eventService.updateType(request.body.guid, request.body.name);
  }

  @Delete('/types')
  @Roles('admin')
  @ValidateBody(z.object({ guid: z.string().max(36) }))
  async removeType(request: FastifyRequest<{ Body: { guid: string } }>) {
    return this.eventService.removeType(request.body.guid);
  }

  @Get('/my')
  async getMyEvents(request: FastifyRequest) {
    const events = await this.eventService.getByUser(request.user.guid);
    return EventPresenter.presentMany(events);
  }

  @Get('/registration')
  @ValidateQuery(checkRegistrationSchema)
  async checkRegistration(request: FastifyRequest<{ Querystring: CheckRegistrationDto }>) {
    return this.eventService.getRegistration(request.query.guidEvent, request.user.guid);
  }

  @Post('/register')
  @ValidateBody(registerEventSchema)
  async register(request: FastifyRequest<{ Body: registerEventDto }>) {
    return this.eventService.register(request.body.guidEvent, request.user.guid)
  }

  @Post('/attend')
  @Roles('organizer', 'admin')
  @ValidateBody(z.object({ registrationGuid: z.string().max(36) }))
  async attend(request: FastifyRequest<{ Body: { registrationGuid: string } }>) {
    return this.eventService.markAttended(request.body.registrationGuid);
  }


  @Post('/create')
  @Roles('organizer', 'admin')
  @ValidateBody(createEventSchema)
  async create(request: FastifyRequest<{ Body: createEventDto }>) {
    return await this.eventService.create(request.body);
  }

  @Post('/update')
  @Roles('organizer', 'admin')
  @ValidateBody(updateEventSchema)
  async update(request: FastifyRequest<{ Body: updateEventDto }>) {
    return await this.eventService.update(request.body);
  }

  @Delete('/')
  @Roles('organizer', 'admin')
  @ValidateBody(deleteEventSchema)
  async remove(request: FastifyRequest<{ Body: deleteEventDto }>) {
    return this.eventService.remove(request.body.guid);
  }
}
