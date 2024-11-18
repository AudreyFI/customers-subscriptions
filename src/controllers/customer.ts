import { Request, Response } from 'express'
import { CreateCustomerDto, UpdateCustomerDto } from '../models/customer.dto'
import { CustomerRepository } from '../repositories/customer'
import { Inject, Service } from 'typedi'
import { ValidationError as ClassValidationError } from 'class-validator'
import { ValidationError } from 'sequelize'

@Service()
export class CustomerController {
  @Inject()
  repository!: CustomerRepository

  async getAll(req: Request, res: Response) {
    // TODO : Add pagination
    // TODO : Add filtering
    const customers = await this.repository.getAll()
    res.status(200).send(customers)
  }

  async get(req: Request, res: Response) {
    const id = req.params.id
    const customer = await this.repository.get(id)

    if (!customer) {
      res.status(404).send({
        type: 'Not found',
        message: `Customer with id ${id} not found`,
      })
    } else {
      res.status(200).send(customer)
    }
  }

  async create(req: Request, res: Response) {
    const createCustomerDto: CreateCustomerDto = CreateCustomerDto.fromRequest(
      req.body,
    )
    const hasErrors: ClassValidationError[] | null =
      await CreateCustomerDto.hasErrors(createCustomerDto)

    if (hasErrors instanceof Array && hasErrors.length > 0) {
      res.status(400).send({
        type: 'Invalid attribute(s)',
        message: `${(hasErrors as ClassValidationError[]).map((e) => e.property)}`,
      })
    } else {
      try {
        const customer = await this.repository.create(createCustomerDto)
        res.status(201).send(customer)
      } catch (error: Error | unknown) {
        res.status(400).send({
          type: 'Validation error',
          message: `${(error as ValidationError).errors?.[0]?.message}`,
        })
      }
    }
  }

  async update(req: Request, res: Response) {
    const hasErrors: ClassValidationError[] | null =
      await UpdateCustomerDto.hasErrors(UpdateCustomerDto.fromRequest(req.body))

    if (hasErrors instanceof Array && hasErrors.length > 0) {
      res.status(400).send({
        type: 'Invalid attribute(s)',
        message: `${(hasErrors as ClassValidationError[]).map((e) => e.property)}`,
      })
    }
    try {
      await this.repository.update(req.body)
      res.status(200).send(req.body)
    } catch (error) {
      res.status(404).send({
        type: 'Validation error',
        message: `${(error as ValidationError).errors?.[0]?.message}`,
      })
    }
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id
    try {
      await this.repository.delete(id)
      res.status(200).send({})
    } catch (error) {
      res.status(404).send({
        type: 'Non processable entity',
        message: `Unable to delete customer with id ${id}`,
      })
    }
  }
}
