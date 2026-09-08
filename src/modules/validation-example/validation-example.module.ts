import { Module } from '@nestjs/common'

import { ValidationExampleService } from './validation-example.service.js'
import { ValidationExampleController } from './validation-example.controller.js'

@Module({
  providers: [ValidationExampleService],
  controllers: [ValidationExampleController],
})
export class ValidationExampleModule {}
