import { Min, IsInt, IsEmail, IsString, IsNotEmpty } from 'class-validator'

export class CreateValidationExampleDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @IsInt()
  @Min(18)
  age: number
}
