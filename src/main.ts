import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'

import { AppModule, ObserveInstrument } from './app.module.js'
import { createValidationPipe } from './common/pipes/validation.pipe.js'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      instrument: ObserveInstrument,
    },
  )

  app.useGlobalPipes(createValidationPipe())

  const configService = app.get(ConfigService)

  const port = configService.getOrThrow<number>('app.PORT', 3000)

  await app.listen(port, '0.0.0.0')

  const logger = new Logger('Bootstrap')
  logger.log(`Application is running on: ${await app.getUrl()}`)
}

await bootstrap()
