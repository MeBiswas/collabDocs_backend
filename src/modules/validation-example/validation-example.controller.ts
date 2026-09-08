import { Body, Post, Controller } from '@nestjs/common'

import { ValidationExampleService } from './validation-example.service.js'
import { CreateValidationExampleDto } from './dto/create-validation-example.dto.js'

@Controller('validation-example')
export class ValidationExampleController {
  constructor(
    private readonly validationExampleService: ValidationExampleService,
  ) {}

  @Post()
  create(@Body() dto: CreateValidationExampleDto) {
    return this.validationExampleService.create(dto)
  }
}
