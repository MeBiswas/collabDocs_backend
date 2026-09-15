import { HealthService } from '../src/modules/health/health.service.js'
import { HealthController } from '../src/modules/health/health.controller.js'

describe('Health Controller', () => {
  let controller: HealthController

  beforeAll(async () => {
    controller = new HealthController(new HealthService())
  })

  it('should return a healthy status', () => {
    expect(controller.checkHealth()).toEqual({
      status: 'ok',
    })
  })
})
