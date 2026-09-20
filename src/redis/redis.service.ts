import type { Redis } from 'ioredis'
import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common'

import { REDIS_CLIENT } from './redis.constants.js'

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  /**
   * Retrieve a cached string value by key.
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  /**
   * Store a key-value pair with an optional Time-To-Live (in seconds).
   */
  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    if (ttlSeconds) {
      return this.client.set(key, value, 'EX', ttlSeconds)
    }
    return this.client.set(key, value)
  }

  /**
   * Delete one or more keys.
   */
  async del(key: string): Promise<number> {
    return this.client.del(key)
  }

  /**
   * Check if a key exists in Redis (returns true if 1, false if 0).
   */
  async exists(key: string): Promise<boolean> {
    const count = await this.client.exists(key)
    return count > 0
  }

  /**
   * Set a TTL on an existing key.
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds)
    return result === 1
  }

  /**
   * Expose the raw client for specialized needs (Pub/Sub, BullMQ, multi-exec).
   */
  getClient(): Redis {
    return this.client
  }

  /**
   * Cleanly disconnect the client on NestJS shutdown.
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Closing Redis connection...')
    await this.client.quit()
  }
}
