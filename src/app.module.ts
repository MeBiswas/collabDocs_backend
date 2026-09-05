import { Module } from '@nestjs/common'
import { createObserveModule } from '@nestjs/observe'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { AppService } from './app.service.js'
import { AppController } from './app.controller.js'
import configuration from './config/configuration.js'
import envValidationSchema from './config/env.validation.js'

export const { ObserveModule, ObserveInstrument } = createObserveModule()

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    // ObserveModule.forRoot({
    //   appKey: process.env.APP_KEY!,
    //   appSecret: process.env.APP_SECRET!,
    //   serviceId: process.env.SERVICE_ID ?? 'collabDocs_backend',
    // }),
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
