import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { Logger, ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'

import { AppModule, ObserveInstrument } from './app.module.js'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      instrument: ObserveInstrument,
    },
  )

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  const configService = app.get(ConfigService)

  const port = configService.getOrThrow<number>('app.PORT', 3000)

  await app.listen(port, '0.0.0.0')

  const logger = new Logger('Bootstrap')
  logger.log(`Application is running on: ${await app.getUrl()}`)
}

await bootstrap()
