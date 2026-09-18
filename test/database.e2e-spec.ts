import { Connection } from 'mongoose'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { getConnectionToken } from '@nestjs/mongoose'

import { DatabaseModule } from '../src/database/database.module.js'
import {
  startInMemoryMongo,
  stopInMemoryMongo,
} from './helpers/mongo-memory.helper.js'

describe('DatabaseModule (Integration)', () => {
  let moduleRef: TestingModule
  let connection: Connection

  beforeAll(async () => {
    const mongoUri = await startInMemoryMongo()

    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              database: {
                uri: mongoUri,
              },
            }),
          ],
        }),
        DatabaseModule,
      ],
    }).compile()

    connection = moduleRef.get<Connection>(getConnectionToken())
  })

  afterAll(async () => {
    if (connection) {
      await connection.close()
    }
    if (moduleRef) {
      await moduleRef.close()
    }
    await stopInMemoryMongo()
  })

  it('should establish an active MongoDB connection', () => {
    expect(connection.readyState).toBe(1)
  })
})
