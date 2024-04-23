import { IsString, IsUUID, ValidationError } from 'class-validator'
import { transform, hasErrors } from '../core/validator'

export interface CustomerSubscription {
  id?: string
  customerId: string
  subscriptionId: string
}

export class CreateCustomerSubscriptionDto implements CustomerSubscription {
  @IsString()
  @IsUUID()
  customerId!: string

  @IsString()
  @IsUUID()
  subscriptionId!: string

  static fromRequest(body: unknown): CustomerSubscription {
    return transform(this, body)
  }

  static async hasErrors(
    body: CustomerSubscription,
  ): Promise<ValidationError[] | null> {
    return await hasErrors(body)
  }
}
