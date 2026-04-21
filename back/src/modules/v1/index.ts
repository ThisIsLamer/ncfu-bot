import { Module } from "#src/core/decorators/index.js";
import { EventController } from "./event/event.controller.js";
import { InstituteController } from "./institute/institute.controller.js";
import { UserController } from "./user/user.controller.js";

@Module({
  prefix: 'webapp',
  version: 'v1',
  controllers: [
    EventController,
    InstituteController,
    UserController
  ]
})
export class V1Module {}
