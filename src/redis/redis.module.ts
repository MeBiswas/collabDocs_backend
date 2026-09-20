import { Redis } from 'ioredis'
import { Module, Global, Logger } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { RedisService } from './redis.service.js'
import { REDIS_CLIENT } from './redis.constants.js'
import { sanitizeRedisUrl } from '../common/utils/sanitize-redis.util.js'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis => {
        const logger = new Logger('RedisModule')
        const redisUrl =
          configService.getOrThrow<string>('redis.url') ||
          'redis://localhost:6379'

        const safeEndpoint = sanitizeRedisUrl(redisUrl)

        const client = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: false,
          retryStrategy(times) {
            if (times > 5) {
              logger.warn(
                'Redis connection retry limit reached. Continuing without cache.',
              )
              return null
            }
            return Math.min(times * 200, 2000)
          },
        })

        // 1. Socket connected
        client.on('connect', () => {
          logger.log('TCP connection to Redis established')
        })

        // 2. Ready to receive commands
        client.on('ready', () => {
          logger.log('Redis client is ready to accept commands')
        })

        // 3. Error handling
        client.on('error', (err: any) => {
          logger.error(
            `Redis connection failure: [${safeEndpoint}]: ${err.message}`,
          )
        })

        // 4. Connection dropped / reconnecting
        client.on('reconnecting', (time: number) => {
          logger.warn(`Reconnecting to Redis in ${time}ms...`)
        })

        return client
      },
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
