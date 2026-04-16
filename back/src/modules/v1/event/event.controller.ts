import { Controller, Delete, Get, Post, Roles, ValidateBody, ValidateQuery } from '#src/core/decorators/index.js';
import z from 'zod';
import { EventService } from './event.service.js';
import { EventPresenter } from './event.presenter.js';
import { FastifyRequest } from 'fastify';

const getEventsSchema = z.object({
  search: z.string().optional(),
  filter: z.array(z.string()).optional(),
});
type GetEventDto = z.infer<typeof getEventsSchema>;

const registerEventSchema = z.object({
  guidEvent: z.string().max(36)
})
type registerEventDto = z.infer<typeof registerEventSchema>

const createEventSchema = z.object({
  title: z.string().max(255),
  description: z.string().max(2000),
  date: z.date(),
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
  date: z.date().optional(),
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

  @Get('/my')
  async getMyEvents(request: FastifyRequest) {
    const events = await this.eventService.getByUser(request.user.guid);
    return EventPresenter.presentMany(events);
  }

  @Post('/register')
  @ValidateBody(registerEventSchema)
  async register(request: FastifyRequest<{ Body: registerEventDto }>) {
    return this.eventService.register(request.body.guidEvent, request.user.guid)
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
