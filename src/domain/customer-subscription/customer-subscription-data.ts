import { SubscriptionStatus } from './subscription-state'

export type CustomerSubscriptionDataModel = {
  id?: string
  email: string
  firstname?: string
  lastname?: string
  subscriptions?: SubscriptionDataModel[]
}
export type SubscriptionDataModel = {
  id: string
  startDate: string
  endDate: string
  customerSubscription: { status: SubscriptionStatus }
}

export type InvalidCustomerSubscription = {
  customerId: string
  email: string
  firstname: string
  lastname: string
  subscription: InvalidSubscription
}
export type InvalidSubscription = {
  id: string
  startDate: string
  endDate: string
  status: SubscriptionStatus
}
