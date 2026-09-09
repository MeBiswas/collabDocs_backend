import { vi } from 'vitest'
import request from 'supertest'
import { Test, TestingModule } from '@nestjs/testing'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'

import { createValidationPipe } from '../src/common/pipes/validation.pipe.js'
import { ValidationExampleModule } from '../src/modules/validation-example/validation-example.module.js'
import { ValidationExampleService } from '../src/modules/validation-example/validation-example.service.js'

describe('Validation Pipeline (Integration / E2E)', () => {
  let app: NestFastifyApplication
  let service: ValidationExampleService

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ValidationExampleModule],
    }).compile()

    // Replicate production Fastify environment exactly
    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    app.useGlobalPipes(createValidationPipe())

    await app.init()
    await app.getHttpAdapter().getInstance().ready()

    service = moduleRef.get<ValidationExampleService>(ValidationExampleService)
  })

  afterAll(async () => {
    await app.close()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('POST /validation-example returns 201 and invokes service for valid payload', async () => {
    const spy = vi.spyOn(service, 'create')

    const res = await request(app.getHttpServer())
      .post('/validation-example')
      .send({
        name: 'Sandeep',
        email: 'sandeep@example.com',
        age: 25,
      })
      .expect(201)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(res.body.data.name).toBe('Sandeep')
  })

  it('POST /validation-example returns 400 and NEVER reaches service method on invalid data', async () => {
    const spy = vi.spyOn(service, 'create')

    const res = await request(app.getHttpServer())
      .post('/validation-example')
      .send({
        name: '',
        email: 'invalid-email',
        age: 10,
      })
      .expect(400)

    // Verifies architectural safety: malformed requests halt at the pipe
    expect(spy).not.toHaveBeenCalled()
    expect(res.body.error).toBe('Validation Error')
    expect(res.body.errors).toHaveProperty('email')
    expect(res.body.errors).toHaveProperty('age')
  })

  it('POST /validation-example rejects unknown properties (forbidNonWhitelisted)', async () => {
    const spy = vi.spyOn(service, 'create')

    await request(app.getHttpServer())
      .post('/validation-example')
      .send({
        name: 'Sandeep',
        email: 'sandeep@example.com',
        age: 25,
        isAdmin: true, // Unexpected property
      })
      .expect(400)

    expect(spy).not.toHaveBeenCalled()
  })
})
