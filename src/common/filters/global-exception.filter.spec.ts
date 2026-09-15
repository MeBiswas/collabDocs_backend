import { vi, type Mock } from 'vitest'
import { GlobalExceptionFilter } from './global-exception.filter.js'
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter
  let mockStatus: Mock
  let mockSend: Mock
  let mockReply: any
  let mockRequest: any
  let mockHost: ArgumentsHost
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    filter = new GlobalExceptionFilter()
    mockSend = vi.fn()
    mockStatus = vi.fn().mockReturnValue({ send: mockSend })
    mockReply = { status: mockStatus }
    mockRequest = {
      method: 'POST',
      url: '/test',
      requestId: 'req-uuid-123',
    }
    mockHost = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockReply,
      }),
    } as unknown as ArgumentsHost

    // Suppress console error logging during tests
    vi.spyOn((filter as any).logger, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    vi.clearAllMocks()
  })

  it('should handle standard HttpException and preserve status code', () => {
    const exception = new HttpException(
      'Forbidden Resource',
      HttpStatus.FORBIDDEN,
    )

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN)
    expect(mockSend).toHaveBeenCalledWith({
      statusCode: HttpStatus.FORBIDDEN,
      error: 'HTTP_ERROR',
      message: 'Forbidden Resource',
      requestId: 'req-uuid-123',
    })
  })

  it('should preserve custom fields from structured validation exceptions', () => {
    const customPayload = {
      statusCode: 400,
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      fields: { email: ['email must be valid'] },
    }
    const exception = new HttpException(customPayload, HttpStatus.BAD_REQUEST)

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(400)
    expect(mockSend).toHaveBeenCalledWith({
      statusCode: 400,
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      fields: { email: ['email must be valid'] },
      requestId: 'req-uuid-123',
    })
  })

  it('should return safe generic message and 500 for unhandled exceptions in production', () => {
    process.env.NODE_ENV = 'production'
    const exception = new Error('DATABASE_PASSWORD leak attempt')

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(500)
    expect(mockSend).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      requestId: 'req-uuid-123',
    })
    // Verify internal details/stack traces are never present in the payload sent to clients
    expect(mockSend.mock.calls[0][0]).not.toHaveProperty('stack')
  })

  it('should pass through developer error message for unhandled errors in non-production', () => {
    process.env.NODE_ENV = 'development'
    const exception = new Error('Query timeout error')

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(500)
    expect(mockSend).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Query timeout error',
      requestId: 'req-uuid-123',
    })
  })
})
