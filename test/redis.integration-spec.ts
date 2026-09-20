import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import redisConfig from '../src/config/redis.config.js'
import { RedisModule } from '../src/redis/redis.module.js'
import { RedisService } from '../src/redis/redis.service.js'

describe('RedisService (Integration)', () => {
  let redisService: RedisService
  let moduleRef: TestingModule

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [redisConfig],
        }),
        RedisModule,
      ],
    }).compile()

    redisService = moduleRef.get<RedisService>(RedisService)
  })

  afterAll(async () => {
    // Close the connection to prevent open Jest handles
    await moduleRef.close()
  })

  it('should write and read back a test key (Acceptance Criterion 4)', async () => {
    const testKey = 'story005:test'
    const testValue = 'hello'

    // 1. Write the test key
    const setResult = await redisService.set(testKey, testValue, 10)
    expect(setResult).toBe('OK')

    // 2. Read the test key back
    const retrievedValue = await redisService.get(testKey)
    expect(retrievedValue).toBe(testValue)

    // 3. Clean up the key
    await redisService.del(testKey)

    // 4. Verify it no longer exists
    const exists = await redisService.exists(testKey)
    expect(exists).toBe(false)
  })
})
