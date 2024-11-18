import { Service } from 'typedi'
import {
  SubscriptionDto,
  Subscription as SubscriptionInterface,
} from '../models/subscription.dto'
import { subscription } from '../models/subscription.model'
import { Repository } from './repository.interface'

@Service()
export class SubscriptionRepository
  implements Repository<SubscriptionInterface>
{
  async getAll() {
    // TODO : Add pagination
    // TODO : Add filtering
    return (await subscription.findAll()) as unknown as SubscriptionInterface[]
  }

  async getByStartDateAndEndDate(startDate: string, endDate: string) {
    return (await subscription.findOne({
      where: { startDate, endDate },
    })) as unknown as SubscriptionInterface
  }

  async get(id: string) {
    return (await subscription.findByPk(id)) as unknown as SubscriptionInterface
  }

  async create(createSubscriptionDto: SubscriptionDto) {
    return (await subscription.create(
      createSubscriptionDto as SubscriptionDto,
    )) as unknown as SubscriptionInterface
  }

  async update(): Promise<never> {
    throw new Error('Method not implemented.')
  }

  async delete(id: string) {
    return (await subscription.destroy({
      where: { id },
    })) as unknown as SubscriptionInterface
  }
}
