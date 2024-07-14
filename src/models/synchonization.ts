import { customerSubscription } from './customer-subscription.model'
import { customer } from './customer.model'
import { subscription } from './subscription.model'

export const synchronizeModels = async () => {
  await customer.sync()
  await subscription.sync()
  await customerSubscription.sync()
}
