import {
  ValidationPipe,
  ValidationError,
  BadRequestException,
} from '@nestjs/common'

function flattenValidationErrors(
  errors: ValidationError[],
): Record<string, string[]> {
  const flattenedResult: Record<string, string[]> = {}

  for (const error of errors) {
    const property = error.property
    flattenedResult[property] = Object.values(error.constraints || {})
  }

  return flattenedResult
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,

    exceptionFactory: (errors: ValidationError[]) => {
      const flattenedErrors = flattenValidationErrors(errors)

      return new BadRequestException({
        statusCode: 400,
        errors: flattenedErrors,
        error: 'Validation Error',
        message: 'Request validation failed',
      })
    },
  })
}
