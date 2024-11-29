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
import { SubscriptionStatus } from '../domain/subscription/subscription-status'

export interface CustomerSubscription {
  customerId: string
  subscriptionId?: string
  status?: SubscriptionStatus
  amount?: number
  paymentDate?: string
  startDate?: string
  endDate?: string
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

export class UpdateCustomerSubscriptionDto implements CustomerSubscription {
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

  static fromRequest(body: unknown): UpdateCustomerSubscriptionDto {
    return transform(this, body)
  }

  static async hasErrors(
    body: UpdateCustomerSubscriptionDto,
  ): Promise<ValidationError[] | null> {
    return await hasErrors(body)
  }
}
