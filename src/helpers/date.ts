import { SubscriptionType } from '../models/subscription.dto'

export const convertPeriodToEndDate = (
  startDate: string,
  type: SubscriptionType,
) => {
  const date = new Date(startDate)
  return type === SubscriptionType.QUARTERLY
    ? new Date(date.setMonth(date.getMonth() + 3)).toISOString()
    : new Date(date.setFullYear(date.getFullYear() + 1)).toISOString()
}
