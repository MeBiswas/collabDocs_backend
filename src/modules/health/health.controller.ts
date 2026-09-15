import { Controller, Get } from '@nestjs/common'

import { HealthService } from './health.service.js'

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  checkHealth() {
    return this.healthService.getHealth()
  }

  @Get('test-error')
  throwUnhandledError() {
    throw new Error('Database connection leak details: pass=secret123')
  }
}
