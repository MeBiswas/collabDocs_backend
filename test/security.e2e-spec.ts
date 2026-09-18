import request from 'supertest'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { Module } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'

import { AppModule } from '../src/app.module.js'
import { DatabaseModule } from '../src/database/database.module.js'
import { createValidationPipe } from '../src/common/pipes/validation.pipe.js'
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter.js'

@Module({})
class TestDatabaseModule {}

describe('Security & Request Infrastructure (e2e)', () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(TestDatabaseModule)
      .compile()

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )

    await app.register(helmet)
    await app.register(cors, {
      origin: ['http://localhost:3000', 'https://trusted-client.com'],
    })

    app.useGlobalPipes(createValidationPipe())
    app.useGlobalFilters(new GlobalExceptionFilter())

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
  })

  describe('Security Headers (Helmet)', () => {
    it('should attach standard security defensive headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200)

      expect(response.headers['x-content-type-options']).toBe('nosniff')
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN')
      expect(response.headers['x-download-options']).toBe('noopen')
    })
  })

  describe('Request Correlation IDs', () => {
    it('should generate a new X-Request-ID when not provided by client', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200)

      expect(response.headers['x-request-id']).toBeDefined()
      expect(typeof response.headers['x-request-id']).toBe('string')
      expect(response.headers['x-request-id'].length).toBeGreaterThan(10)
    })

    it('should preserve and reflect client-provided X-Request-ID', async () => {
      const customId = 'trace-uuid-abcdef-123456'

      const response = await request(app.getHttpServer())
        .get('/health')
        .set('x-request-id', customId)
        .expect(200)

      expect(response.headers['x-request-id']).toBe(customId)
    })
  })

  describe('CORS Restrictions', () => {
    it('should allow whitelisted origin', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('Origin', 'https://trusted-client.com')

      expect(response.headers['access-control-allow-origin']).toBe(
        'https://trusted-client.com',
      )
    })

    it('should reject or not provide allow header for unlisted origin', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('Origin', 'http://malicious-attacker.com')

      expect(response.headers['access-control-allow-origin']).toBeUndefined()
    })
  })

  describe('Production-Safe 500 Responses', () => {
    it('should normalize unhandled exceptions and never leak stack traces or internal secrets', async () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      try {
        const response = await request(app.getHttpServer())
          .get('/validation-example/test-error')
          .expect(500)

        expect(response.body).toMatchObject({
          statusCode: 500,
          error: 'INTERNAL_SERVER_ERROR',
        })
        expect(response.body.requestId).toBeDefined()

        expect(response.body).not.toHaveProperty('stack')
        expect(JSON.stringify(response.body)).not.toContain('secret123')
      } finally {
        if (originalNodeEnv === undefined) {
          delete process.env.NODE_ENV
        } else {
          process.env.NODE_ENV = originalNodeEnv
        }
      }
    })
  })
})
