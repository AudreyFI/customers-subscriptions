import { Request, Response } from 'express'
import { CreateCustomerSubscriptionDto } from '../models/customer-subscription.dto'
import { ValidationError as ClassValidationError } from 'class-validator'
import { ValidationError } from 'sequelize'
import { Inject, Service } from 'typedi'
import { CustomerSubscriptionRepository } from '../repositories/customer-subscription'
import { CustomerRepository } from '../repositories/customer'
import { SubscriptionRepository } from '../repositories/subscription'

@Service()
export class CustomerSubscriptionController {
  @Inject()
  repository!: CustomerSubscriptionRepository
  @Inject()
  customerRepository!: CustomerRepository
  @Inject()
  subscriptionRepository!: SubscriptionRepository

  async getAll(req: Request, res: Response) {
    const customerSubscriptions = await this.repository.getAll()
    res.status(200).send(customerSubscriptions)
  }

  async getAllByCustomer(req: Request, res: Response) {
    const customerId = req.params.customerId
    const customer = await this.customerRepository.get(customerId)

    if (!customer) {
      res.status(404).send(`Customer with id ${customerId} not found`)
    } else {
      const customerSubscriptions =
        await this.repository.getAllByCustomer(customerId)
      res.status(200).send(customerSubscriptions)
    }
  }

  async addSubscription(req: Request, res: Response) {
    const createCustomerSubscriptionDto: CreateCustomerSubscriptionDto =
      CreateCustomerSubscriptionDto.fromRequest(req.body)

    const hasErrors: ClassValidationError[] | null =
      await CreateCustomerSubscriptionDto.hasErrors(
        createCustomerSubscriptionDto,
      )

    if (hasErrors instanceof Array && hasErrors.length > 0) {
      res.status(400).send({
        message: `Invalid attribute(s): ${(hasErrors as ClassValidationError[]).map((e) => e.property)}`,
      })
    } else {
      const customerId = req.body.customerId
      const customer = await this.customerRepository.get(customerId)
      const subscriptionId = req.body.subscriptionId
      const subscription = await this.subscriptionRepository.get(subscriptionId)
      if (!customer || !subscription) {
        res
          .status(404)
          .send(
            `Customer with id ${customerId} or Subscription with id ${subscriptionId} not found`,
          )
      } else {
        try {
          const customerSubscription = await this.repository.create(
            createCustomerSubscriptionDto,
          )
          res.status(201).send(customerSubscription)
        } catch (error: ValidationError | unknown) {
          res
            .status(400)
            .send(
              `Validation error: ${(error as ValidationError).errors?.[0]?.message}`,
            )
        }
      }
    }
  }
}
