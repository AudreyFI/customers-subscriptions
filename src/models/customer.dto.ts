import { IsNotEmpty, IsString, IsUUID, ValidationError } from 'class-validator'
import { transform, hasErrors } from '../core/validator'

export interface Customer {
  id?: string
  lastname?: string | undefined
  firstname: string
  email?: string | undefined
}

export class UpdateCustomerDto implements Customer {
  @IsString()
  @IsUUID()
  id!: string

  @IsString()
  lastname?: string

  @IsString()
  @IsNotEmpty()
  firstname!: string

  @IsString()
  email?: string

  static fromRequest(body: unknown): Customer {
    return transform(this, body)
  }

  static async hasErrors(body: Customer): Promise<ValidationError[] | null> {
    return await hasErrors(body)
  }
}

export class CreateCustomerDto implements Customer {
  @IsString()
  lastname?: string

  @IsString()
  @IsNotEmpty()
  firstname!: string

  @IsString()
  email?: string

  static fromRequest(body: unknown): Customer {
    return transform(this, body)
  }

  static async hasErrors(body: Customer): Promise<ValidationError[] | null> {
    return await hasErrors(body)
  }
}
