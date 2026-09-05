import { Module } from '@nestjs/common'
import { createObserveModule } from '@nestjs/observe'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { AppService } from './app.service.js'
import { AppController } from './app.controller.js'
import configuration from './config/configuration.js'
import envValidationSchema from './config/env.validation.js'
import { HealthModule } from './modules/health/health.module.js'

export const { ObserveModule, ObserveInstrument } = createObserveModule()

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    ObserveModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        appKey: configService.getOrThrow<string>('observe.APP_KEY'),
        appSecret: configService.getOrThrow<string>('observe.APP_SECRET'),
        serviceId:
          configService.get<string>('observe.SERVICE_ID') ??
          'collabDocs_backend',
      }),
    }),
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
