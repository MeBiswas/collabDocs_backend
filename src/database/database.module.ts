import { Connection } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { Module, Logger } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { sanitizeMongoURI } from '../common/utils/sanitize-uri.util.js'

const logger = new Logger('DatabaseModule')

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const rawUri = configService.getOrThrow<string>('database.uri')
        const safeUri = sanitizeMongoURI(rawUri)

        return {
          uri: rawUri,
          serverSelectionTimeoutMS: 5000,

          connectionFactory: (connection: Connection) => {
            connection.on('connected', () => {
              logger.log(`MongoDB connection established: ${safeUri} `)
            })

            connection.on('error', (error: Error) => {
              const safeErrorMessage = error.message.replace(/\/\/[^@]+@/, '//')
              logger.error(
                `MongoDB connection error for ${safeUri}: ${safeErrorMessage}`,
              )
            })

            connection.on('disconnected', () => {
              logger.warn(`MongoDB connection lost: ${safeUri}`)
            })

            return connection
          },
        }
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
