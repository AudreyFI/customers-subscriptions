import { Op } from 'sequelize'
import { Service } from 'typedi'
import {
  CustomerSubscriptionDataModel,
  InvalidCustomerSubscription,
} from '../domain/customer-subscription/customer-subscription-data'
import { SubscriptionStatus } from '../domain/subscription/subscription-status'
import {
  CreateCustomerSubscriptionDto,
  CustomerSubscription as CustomerSubscriptionInterface,
  UpdateCustomerSubscriptionDto,
} from '../models/customer-subscription.dto'
import { customerSubscription } from '../models/customer-subscription.model'
import { customer } from '../models/customer.model'
import { subscription } from '../models/subscription.model'
import { Repository } from './repository.interface'

@Service()
export class CustomerSubscriptionRepository
  implements Repository<CustomerSubscriptionInterface>
{
  async getAll() {
    // TODO : Add pagination
    // TODO : Add filtering
    return (await customerSubscription.findAll()) as unknown as CustomerSubscriptionInterface[]
  }

  async getAllByCustomer(customerId: string) {
    return await customerSubscription.findAll({
      where: {
        customerId,
      },
    })
  }

  async getByCustomerAndSubscription(
    customerId: string,
    subscriptionId: string,
  ) {
    return (await customerSubscription.findAll({
      where: {
        customerId,
        subscriptionId,
      },
    })) as unknown as CustomerSubscriptionInterface[]
  }

  async get(): Promise<never> {
    throw new Error('Method not implemented.')
  }

  async create(createCustomerSubscriptionDto: CreateCustomerSubscriptionDto) {
    return (await customerSubscription.create(
      createCustomerSubscriptionDto as CreateCustomerSubscriptionDto,
    )) as unknown as CustomerSubscriptionInterface
  }

  async update(updateCustomerSubscriptionDto: UpdateCustomerSubscriptionDto) {
    const existingCustomerSubscription = await customerSubscription.findOne({
      where: {
        customerId: updateCustomerSubscriptionDto.customerId,
        subscriptionId: updateCustomerSubscriptionDto.subscriptionId,
      },
    })
    if (!existingCustomerSubscription) {
      throw new Error(`CustomerSubscription not found`)
    }
    await customerSubscription.update(updateCustomerSubscriptionDto, {
      where: {
        customerId: updateCustomerSubscriptionDto.customerId,
        subscriptionId: updateCustomerSubscriptionDto.subscriptionId,
      },
    })
    return updateCustomerSubscriptionDto as unknown as UpdateCustomerSubscriptionDto
  }

  async delete(): Promise<never> {
    throw new Error('Method not implemented.')
  }

  async deleteCustomerSubscription(customerId: string, subscriptionId: string) {
    return (await customerSubscription.destroy({
      where: { customerId, subscriptionId },
    })) as unknown as CustomerSubscriptionInterface
  }

  async getInvalidSubscriptions(
    before: string,
    after: string,
  ): Promise<InvalidCustomerSubscription[]> {
    const result = await customer.findAll({
      attributes: ['id', 'lastname', 'firstname', 'email'],
      include: [
        {
          model: subscription,
          where: {
            endDate: {
              [Op.between]: [before, after],
            },
          },
          attributes: ['id', 'startDate', 'endDate'],
          order: [['startDate', 'ASC']],
          through: {
            as: 'customerSubscription',
            attributes: ['status'],
            where: {
              status: {
                [Op.ne]: 'ended',
              },
            },
          },
        },
      ],
    })
    return this.mapToCustomerSubscriptionData(result)
  }

  async hasNextSubscriptions(id: string, endDate: string): Promise<boolean> {
    const result = await customer.findAll({
      attributes: ['id'],
      where: { id },
      include: {
        model: subscription,
        where: {
          startDate: {
            [Op.gt]: endDate,
          },
        },
        attributes: ['id'],
        through: {
          attributes: ['status'],
          where: {
            status: {
              [Op.ne]: 'ended',
            },
          },
        },
        order: [['startDate', 'ASC']],
      },
    })
    return !!result?.length
  }

  private mapToCustomerSubscriptionData(
    customerSubscriptions: unknown[],
  ): InvalidCustomerSubscription[] {
    return customerSubscriptions.map((cs) => {
      const subscription = (cs as CustomerSubscriptionDataModel)
        .subscriptions?.[0]
      return {
        customerId: (cs as CustomerSubscriptionDataModel).id as string,
        email: (cs as CustomerSubscriptionDataModel).email,
        firstname: (cs as CustomerSubscriptionDataModel).firstname as string,
        lastname: (cs as CustomerSubscriptionDataModel).lastname as string,
        subscription: {
          id: subscription?.id as string,
          endDate: subscription?.endDate as string,
          startDate: subscription?.startDate as string,
          status: subscription?.customerSubscription
            .status as SubscriptionStatus,
        },
      }
    })
  }
}
