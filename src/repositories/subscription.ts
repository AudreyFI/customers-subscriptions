import { Service } from 'typedi'
import {
  CreateSubscriptionDto,
  Subscription as SubscriptionInterface,
  UpdateSubscriptionDto,
} from '../models/subscription.dto'
import { Subscription } from '../models/subscription.model'
import { Repository } from './repository.interface'

@Service()
export class SubscriptionRepository
  implements Repository<SubscriptionInterface>
{
  async getAll() {
    // TODO : Add pagination
    // TODO : Add filtering
    return (await Subscription.findAll()) as unknown as SubscriptionInterface[]
  }

  async getByStartDateAndEndDate(startDate: string, endDate: string) {
    return (await Subscription.findOne({
      where: { startDate, endDate },
    })) as unknown as SubscriptionInterface[]
  }

  async get(id: string) {
    return (await Subscription.findByPk(id)) as unknown as SubscriptionInterface
  }

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    return (await Subscription.create(
      createSubscriptionDto as CreateSubscriptionDto,
    )) as unknown as SubscriptionInterface
  }

  async update(updateSubscriptionDto: UpdateSubscriptionDto) {
    const existingSubscription = await Subscription.findByPk(
      updateSubscriptionDto.id,
    )
    if (!existingSubscription) {
      throw new Error(
        `Subscription with id ${updateSubscriptionDto.id} not found`,
      )
    }
    await Subscription.update(updateSubscriptionDto, {
      where: { id: updateSubscriptionDto.id },
    })
    return updateSubscriptionDto as unknown as SubscriptionInterface
  }

  async delete(id: string) {
    return (await Subscription.destroy({
      where: { id },
    })) as unknown as SubscriptionInterface
  }
}
