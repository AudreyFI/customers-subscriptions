import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidationError,
} from 'class-validator'
import { transform, hasErrors } from '../core/validator'

export interface Subscription {
  id?: string
  startDate?: string | undefined
  endDate?: string | undefined
  type: SubscriptionType
}

export enum SubscriptionType {
  QUARTERLY = 'quaterly',
  YEARLY = 'yearly',
}

export class UpdateSubscriptionDto implements Subscription {
  @IsString()
  @IsUUID()
  id!: string

  @IsNotEmpty()
  @IsDateString()
  startDate?: string

  @IsNotEmpty()
  @IsEnum(SubscriptionType)
  type!: SubscriptionType

  static fromRequest(body: unknown): Subscription {
    return transform(this, body)
  }

  static async hasErrors(
    body: Subscription,
  ): Promise<ValidationError[] | null> {
    return await hasErrors(body)
  }
}

export class CreateSubscriptionDto implements Subscription {
  @IsDateString()
  @IsNotEmpty()
  startDate?: string

  @IsNotEmpty()
  @IsEnum(SubscriptionType)
  type!: SubscriptionType

  static fromRequest(body: unknown): Subscription {
    return transform(this, body)
  }

  static async hasErrors(
    body: Subscription,
  ): Promise<ValidationError[] | null> {
    return await hasErrors(body)
  }
}
