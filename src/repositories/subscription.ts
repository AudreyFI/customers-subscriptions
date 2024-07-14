import { Service } from 'typedi'
import {
  CreateSubscriptionDto,
  Subscription as SubscriptionInterface,
  UpdateSubscriptionDto,
} from '../models/subscription.dto'
import { Repository } from './repository.interface'
import { subscription } from '../models/subscription.model'

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
    })) as unknown as SubscriptionInterface[]
  }

  async get(id: string) {
    return (await subscription.findByPk(id)) as unknown as SubscriptionInterface
  }

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    return (await subscription.create(
      createSubscriptionDto as CreateSubscriptionDto,
    )) as unknown as SubscriptionInterface
  }

  async update(updateSubscriptionDto: UpdateSubscriptionDto) {
    const existingSubscription = await subscription.findByPk(
      updateSubscriptionDto.id,
    )
    if (!existingSubscription) {
      throw new Error(
        `Subscription with id ${updateSubscriptionDto.id} not found`,
      )
    }
    await subscription.update(updateSubscriptionDto, {
      where: { id: updateSubscriptionDto.id },
    })
    return updateSubscriptionDto as unknown as SubscriptionInterface
  }

  async delete(id: string) {
    return (await subscription.destroy({
      where: { id },
    })) as unknown as SubscriptionInterface
  }
}
