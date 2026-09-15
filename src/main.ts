import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'

import { AppModule } from './app.module.js'
import { createValidationPipe } from './common/pipes/validation.pipe.js'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )

  const configService = app.get(ConfigService)

  const port = configService.getOrThrow<number>('app.PORT', 3000)

  const corsOrigins = configService.getOrThrow<string>(
    'app.CORS_ORIGINS',
    'http://localhost:3000',
  )

  await app.register(helmet)

  await app.register(cors, {
    origin: corsOrigins?.split(',').map((origin) => origin.trim()),
  })

  app.useGlobalPipes(createValidationPipe())

  app.useGlobalFilters(new GlobalExceptionFilter())

  await app.listen(port, '0.0.0.0')

  const logger = new Logger('Bootstrap')
  logger.log(`Application is running on: ${await app.getUrl()}`)
}

await bootstrap()
