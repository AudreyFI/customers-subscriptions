import { Service } from 'typedi'
import {
  CreateCustomerDto,
  Customer as CustomerInterface,
  UpdateCustomerDto,
} from '../models/customer.dto'
import { Customer } from '../models/customer.model'
import { Repository } from './repository.interface'

@Service()
export class CustomerRepository implements Repository<CustomerInterface> {
  async getAll() {
    // TODO : Add pagination
    // TODO : Add filtering
    return (await Customer.findAll()) as unknown as CustomerInterface[]
  }

  async get(id: string) {
    return (await Customer.findByPk(id)) as unknown as CustomerInterface
  }

  async create(createCustomerDto: CreateCustomerDto) {
    return (await Customer.create(
      createCustomerDto as CreateCustomerDto,
    )) as unknown as CustomerInterface
  }

  async update(updateCustomerDto: UpdateCustomerDto) {
    const existingCustomer = await Customer.findByPk(updateCustomerDto.id)
    if (!existingCustomer) {
      throw new Error(`Customer with id ${updateCustomerDto.id} not found`)
    }
    await Customer.update(updateCustomerDto, {
      where: { id: updateCustomerDto.id },
    })
    return updateCustomerDto as unknown as CustomerInterface
  }

  async delete(id: string) {
    return (await Customer.destroy({
      where: { id },
    })) as unknown as CustomerInterface
  }
}
