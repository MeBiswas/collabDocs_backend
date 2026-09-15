import { FastifyReply, FastifyRequest } from 'fastify'
import {
  Catch,
  Logger,
  HttpStatus,
  ArgumentsHost,
  HttpException,
  ExceptionFilter,
} from '@nestjs/common'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const request = context.getRequest<FastifyRequest>()
    const reply = context.getResponse<FastifyReply>()

    const requestWithId = request as FastifyRequest & {
      requestId?: string
      raw?: FastifyRequest & { requestId?: string }
    }
    const requestId =
      requestWithId.requestId ??
      requestWithId.raw?.requestId ??
      request.headers['x-request-id']
    const isProduction =
      (process.env.NODE_ENV ?? 'development') === 'production'

    let error = 'INTERNAL_SERVER_ERROR'
    let message = 'An unexpected error occurred'
    let extraFields: Record<string, unknown> = {}
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus()
      const response = exception.getResponse()

      if (typeof response === 'string') {
        message = response
        error = statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'HTTP_ERROR'
      } else if (typeof response === 'object' && response !== null) {
        const resObj = response as Record<string, unknown>
        message = (resObj.message as string) ?? message
        error =
          (resObj.error as string) ??
          (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'HTTP_ERROR')
        extraFields = resObj
      }
    } else {
      message = isProduction
        ? 'An unexpected error occurred'
        : (exception as Error)?.message || message
    }

    this.logger.error({
      requestId,
      exception,
      statusCode,
      url: request.url,
      method: request.method,
      stack: exception instanceof Error ? exception.stack : undefined,
    })

    return reply.status(statusCode).send({
      error,
      message,
      requestId,
      statusCode,
      ...(extraFields.fields ? { fields: extraFields.fields } : {}),
    })
  }
}
