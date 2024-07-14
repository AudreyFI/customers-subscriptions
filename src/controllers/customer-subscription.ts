import { Request, Response } from 'express'
import { ValidationError as ClassValidationError } from 'class-validator'
import { ValidationError } from 'sequelize'
import { Inject, Service } from 'typedi'
import { CustomerSubscriptionRepository } from '../repositories/customer-subscription'
import { CustomerRepository } from '../repositories/customer'
import { SubscriptionRepository } from '../repositories/subscription'
import { CustomerSubscriptionService } from '../services/customer-subscription.service'
import { CustomerSubscriptionDto } from '../models/customer-subscription.dto'
import { SubscriptionStatus } from '../domain/customer-subscription/subscription-state'
import { EmailTemplate } from '../email/email-library.interface'
import { EmailParam } from '../email/templates/email-param'
import { date15daysBefore, date15daysAfter } from '../helpers/date'

@Service()
export class CustomerSubscriptionController {
  @Inject()
  repository!: CustomerSubscriptionRepository
  @Inject()
  customerRepository!: CustomerRepository
  @Inject()
  subscriptionRepository!: SubscriptionRepository
  @Inject()
  service!: CustomerSubscriptionService

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
    const createCustomerSubscriptionDto: CustomerSubscriptionDto =
      CustomerSubscriptionDto.fromRequest(req.body)

    const hasErrors: ClassValidationError[] | null =
      await CustomerSubscriptionDto.hasErrors(createCustomerSubscriptionDto)

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

  async checkSubscriptionValidity(
    processState: (
      status: SubscriptionStatus,
      hasNextSubscription: boolean,
    ) => {
      nextState: SubscriptionStatus
      template?: (content: EmailParam) => EmailTemplate
    },
    shouldTriggerProcess: (
      subscriptionEndDate: string | undefined,
      state: SubscriptionStatus | undefined,
    ) => boolean,
    req: Request,
    res: Response,
  ) {
    try {
      const invalids = await this.repository.getInvalidSubscriptions(
        date15daysBefore,
        date15daysAfter(),
      )
      if (invalids?.length) {
        const result = await this.service.manageInvalidSubscriptionsFlow(
          processState,
          shouldTriggerProcess,
          invalids,
        )
        res.status(200).send(result)
      }
      res.status(203).send()
    } catch (error) {
      res.status(400).send(error)
    }
  }
}
