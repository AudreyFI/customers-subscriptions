import { Service } from 'typedi'
import {
  CreateCustomerDto,
  Customer as CustomerInterface,
  UpdateCustomerDto,
} from '../models/customer.dto'
import { Repository } from './repository.interface'
import { customer } from '../models/customer.model'
import { subscription } from '../models/subscription.model'

@Service()
export class CustomerRepository implements Repository<CustomerInterface> {
  async getAll() {
    // TODO : Add pagination
    // TODO : Add filtering
    return (await customer.findAll({
      attributes: ['id', 'firstname', 'lastname', 'email'],
      include: [
        {
          model: subscription,
          attributes: ['id', 'startDate', 'endDate'],
          through: {
            attributes: ['paymentDate', 'status', 'amount'],
          },
        },
      ],
    })) as unknown as CustomerInterface[]
  }

  async get(id: string) {
    return (await customer.findByPk(id, {
      attributes: ['id', 'firstname', 'lastname', 'email'],
      include: [
        {
          model: subscription,
          attributes: ['id', 'startDate', 'endDate'],
          through: {
            attributes: ['paymentDate', 'status', 'amount'],
          },
        },
      ],
    })) as unknown as CustomerInterface
  }

  async create(createCustomerDto: CreateCustomerDto) {
    return (await customer.create(
      createCustomerDto as CreateCustomerDto,
    )) as unknown as CustomerInterface
  }

  async update(updateCustomerDto: UpdateCustomerDto) {
    const existingCustomer = await customer.findByPk(updateCustomerDto.id)
    if (!existingCustomer) {
      throw new Error(`Customer with id ${updateCustomerDto.id} not found`)
    }
    await customer.update(updateCustomerDto, {
      where: { id: updateCustomerDto.id },
    })
    return updateCustomerDto as unknown as CustomerInterface
  }

  async delete(id: string) {
    return (await customer.destroy({
      where: { id },
    })) as unknown as CustomerInterface
  }
}
