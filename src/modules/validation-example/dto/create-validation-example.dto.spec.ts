import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'

import { CreateValidationExampleDto } from './create-validation-example.dto.js'

describe('CreateValidationExampleDto (Unit)', () => {
  const validateDto = async (raw: Record<string, any>) => {
    const dto = plainToInstance(CreateValidationExampleDto, raw)
    return validate(dto)
  }

  it('passes validation when given valid attributes', async () => {
    const errors = await validateDto({
      name: 'Sandeep',
      email: 'sandeep@example.com',
      age: 25,
    })

    expect(errors).toHaveLength(0)
  })

  it('rejects an empty name', async () => {
    const errors = await validateDto({
      name: '',
      email: 'sandeep@example.com',
      age: 25,
    })

    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('name')
    expect(errors[0].constraints).toHaveProperty('isNotEmpty')
  })

  it('rejects a malformed email', async () => {
    const errors = await validateDto({
      name: 'Sandeep',
      email: 'not-an-email',
      age: 25,
    })

    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('email')
    expect(errors[0].constraints).toHaveProperty('isEmail')
  })

  it('rejects an age below 18', async () => {
    const errors = await validateDto({
      name: 'Sandeep',
      email: 'sandeep@example.com',
      age: 17,
    })

    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('age')
    expect(errors[0].constraints).toHaveProperty('min')
  })

  it('rejects non-integer ages', async () => {
    const errors = await validateDto({
      name: 'Sandeep',
      email: 'sandeep@example.com',
      age: 25.5,
    })

    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('age')
    expect(errors[0].constraints).toHaveProperty('isInt')
  })

  it('collects multiple errors when multiple fields are invalid', async () => {
    const errors = await validateDto({
      name: '',
      email: 'bad-email',
      age: 15,
    })

    const errorFields = errors.map((err) => err.property)
    expect(errorFields).toEqual(
      expect.arrayContaining(['name', 'email', 'age']),
    )
  })
})
