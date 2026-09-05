import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'

import { AppModule } from '../../app.module.js'

describe('Health Controller', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
  })

  it('GET /health should return 200', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200)

    expect(response.body).toEqual({
      status: 'ok',
    })
  })
})
