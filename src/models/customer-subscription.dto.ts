import {
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidationError,
} from 'class-validator'
import { hasErrors, transform } from '../core/validator'
import { SubscriptionStatus } from '../domain/customer-subscription/subscription-state'

export interface CustomerSubscription {
  id?: string
  customerId: string
  subscriptionId?: string
  status?: SubscriptionStatus
  amount?: number
  paymentDate?: string
  startDate?: string
  endDate?: string
}

export class CustomerSubscriptionDto implements CustomerSubscription {
  @IsString()
  @IsUUID()
  @IsOptional()
  id?: string

  @IsString()
  @IsUUID()
  customerId!: string

  @IsString()
  @IsUUID()
  subscriptionId!: string

  @IsString()
  @IsOptional()
  status?: SubscriptionStatus = 'started'

  @IsOptional()
  @IsDecimal()
  amount?: number

  @IsOptional()
  @IsDateString()
  paymentDate?: string

  static fromRequest(body: unknown): CustomerSubscriptionDto {
    return transform(this, body)
  }

  static async hasErrors(
    body: CustomerSubscriptionDto,
  ): Promise<ValidationError[] | null> {
    return await hasErrors(body)
  }
}

export class CreateCustomerSubscriptionDto implements CustomerSubscription {
  @IsString()
  @IsUUID()
  customerId!: string

  @IsNotEmpty()
  @IsDateString()
  startDate!: string

  @IsNotEmpty()
  @IsDateString()
  endDate!: string

  @IsString()
  @IsOptional()
  status?: SubscriptionStatus = 'started'

  static fromRequest(body: unknown): CreateCustomerSubscriptionDto {
    return transform(this, body)
  }

  static async hasErrors(
    body: CreateCustomerSubscriptionDto,
  ): Promise<ValidationError[] | null> {
    return await hasErrors(body)
  }
}
