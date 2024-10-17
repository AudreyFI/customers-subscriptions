import {
  IsDecimal,
  IsOptional,
  IsString,
  IsUUID,
  ValidationError,
} from 'class-validator'
import { transform, hasErrors } from '../core/validator'
import { SubscriptionStatus } from '../domain/customer-subscription/subscription-state'

export interface CustomerSubscription {
  id?: string
  customerId: string
  subscriptionId: string
  status?: SubscriptionStatus
  amount?: number
}

export class CustomerSubscriptionDto implements CustomerSubscription {
  @IsString()
  @IsUUID()
  customerId!: string

  @IsString()
  @IsUUID()
  subscriptionId!: string

  @IsString()
  @IsOptional()
  status?: SubscriptionStatus = 'started'

  @IsDecimal()
  @IsOptional()
  amount?: number

  static fromRequest(body: unknown): CustomerSubscription {
    return transform(this, body)
  }

  static async hasErrors(
    body: CustomerSubscription,
  ): Promise<ValidationError[] | null> {
    return await hasErrors(body)
  }
}
