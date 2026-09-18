import request from 'supertest'
import { Module } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'

import { AppModule } from './../src/app.module.js'
import { DatabaseModule } from '../src/database/database.module.js'

@Module({})
class TestDatabaseModule {}

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication

  beforeEach(async () => {
    process.env.MONGODB_ATLAS_URI ??= 'mongodb://127.0.0.1:27017/test'

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(TestDatabaseModule)
      .compile()

    app = moduleFixture.createNestApplication(new FastifyAdapter())
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!')
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })
})
