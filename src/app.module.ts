import { LoggerModule } from 'nestjs-pino'
import type { FastifyRequest } from 'fastify'
import { ConfigModule } from '@nestjs/config'
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'

import { AppService } from './app.service.js'
import { AppController } from './app.controller.js'
import configuration from './config/configuration.js'
import envValidationSchema from './config/env.validation.js'
import { HealthModule } from './modules/health/health.module.js'
import { RequestIdMiddleware } from './common/middleware/request-id.middleware.js'
import { ValidationExampleModule } from './modules/validation-example/validation-example.module.js'

@Module({
  imports: [
    HealthModule,
    ValidationExampleModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: true,
        customProps: (req) => ({
          requestId: (
            req as unknown as FastifyRequest & {
              requestId?: string
            }
          ).requestId,
        }),
      },
    }),
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*')
  }
}
