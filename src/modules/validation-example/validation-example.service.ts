import { Injectable } from '@nestjs/common'

import { CreateValidationExampleDto } from './dto/create-validation-example.dto.js'

@Injectable()
export class ValidationExampleService {
  create(dto: CreateValidationExampleDto) {
    return {
      message: 'Request accepted',
      data: dto,
    }
  }
}
