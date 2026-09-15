import { randomUUID } from 'crypto'
import { FastifyRequest, FastifyReply } from 'fastify'
import { Injectable, NestMiddleware } from '@nestjs/common'

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: FastifyRequest, reply: FastifyReply, next: () => void) {
    const incomingRequestId = req.headers['x-request-id'] as string | undefined

    const requestId =
      typeof incomingRequestId === 'string' && incomingRequestId.trim() !== ''
        ? incomingRequestId
        : randomUUID()

    if (typeof reply.header === 'function') {
      reply.header('x-request-id', requestId)
    } else {
      ;(
        reply as unknown as { setHeader: (name: string, value: string) => void }
      ).setHeader('x-request-id', requestId)
    }

    ;(req as FastifyRequest & { requestId: string }).requestId = requestId
    const rawRequest = (
      req as FastifyRequest & { raw?: FastifyRequest & { requestId: string } }
    ).raw
    if (rawRequest) {
      rawRequest.requestId = requestId
    }

    next()
  }
}
