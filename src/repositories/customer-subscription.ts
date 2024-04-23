import { Service } from 'typedi'
import {
  CreateCustomerSubscriptionDto,
  CustomerSubscription as CustomerSubscriptionInterface,
} from '../models/customer-subscription.dto'
import { CustomerSubscription } from '../models/customer-subscription.model'
import { Repository } from './repository.interface'

@Service()
export class CustomerSubscriptionRepository
  implements Repository<CustomerSubscriptionInterface>
{
  async getAll() {
    // TODO : Add pagination
    // TODO : Add filtering
    return (await CustomerSubscription.findAll()) as unknown as CustomerSubscriptionInterface[]
  }

  async getAllByCustomer(customerId: string) {
    return await CustomerSubscription.findAll({
      where: {
        customerId,
      },
    })
  }

  async get(id: string) {
    return (await CustomerSubscription.findByPk(
      id,
    )) as unknown as CustomerSubscriptionInterface
  }

  async create(createCustomerSubscriptionDto: CreateCustomerSubscriptionDto) {
    return (await CustomerSubscription.create(
      createCustomerSubscriptionDto as CreateCustomerSubscriptionDto,
    )) as unknown as CustomerSubscriptionInterface
  }

  async update(): Promise<never> {
    throw new Error('Method not implemented.')
  }

  async delete(): Promise<never> {
    throw new Error('Method not implemented.')
  }
}
