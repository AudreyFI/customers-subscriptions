import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidationError,
} from 'class-validator'
import { hasErrors, transform } from '../core/validator'
import { CustomerSubscription } from './customer-subscription.dto'

export interface Subscription {
  id?: string
  startDate: string
  endDate: string
  paymentDate?: string
  status?: string
  amount?: number
  customerSubscription?: CustomerSubscription
}

export class SubscriptionDto implements Subscription {
  @IsOptional()
  @IsString()
  id?: string

  @IsNotEmpty()
  @IsDateString()
  startDate!: string

  @IsNotEmpty()
  @IsDateString()
  endDate!: string

  static fromRequest(body: unknown): Subscription {
    return transform(this, body)
  }

  static async hasErrors(
    body: Subscription,
  ): Promise<ValidationError[] | null> {
    return await hasErrors(body)
  }
}
