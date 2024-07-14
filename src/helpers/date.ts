import { SubscriptionType } from '../models/subscription.dto'

const toDayOnly = (date: Date) => date.toISOString().split('T')[0]

export const convertPeriodToEndDate = (
  startDate: string,
  type: SubscriptionType,
) => {
  const date = new Date(startDate)
  return type === SubscriptionType.QUARTERLY
    ? toDayOnly(new Date(date.setMonth(date.getMonth() + 3)))
    : toDayOnly(new Date(date.setFullYear(date.getFullYear() + 1)))
}

export const date15daysBefore = toDayOnly(
  new Date(new Date().setDate(new Date().getDate() - 15)),
)
export const date15daysAfter = (date?: Date) => {
  const dateToUse = date || new Date()
  return toDayOnly(new Date(dateToUse.setDate(dateToUse.getDate() + 15)))
}

export const today = toDayOnly(new Date())
