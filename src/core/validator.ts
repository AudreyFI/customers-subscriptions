import { plainToInstance } from 'class-transformer'
import { ValidationError, validate } from 'class-validator'

export const hasErrors = async <T>(
  dto: T,
): Promise<ValidationError[] | null> => {
  const errors = await validate(dto as object)
  if (errors?.length > 0) {
    return errors
  }
  return null
}

export const transform = <T>(
  schema: new () => T,
  requestObject: unknown,
): T => {
  return plainToInstance(schema, requestObject)
}
