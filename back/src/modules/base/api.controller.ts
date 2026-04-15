import { Controller, Get, Public } from "#src/core/decorators/index.js";
import pkg from '#root/package.json' with { type: 'json' };

@Controller('')
export class ApiController {
  @Get('/echo')
  @Public()
  echo() {
    return {
      status: 'active',
      version: pkg.version,
      message: `This NCFU backend service v${pkg.version}`
    }
  }
}