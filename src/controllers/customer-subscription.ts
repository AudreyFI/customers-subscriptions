import { ValidationError as ClassValidationError } from 'class-validator'
import { Request, Response } from 'express'
import { ValidationError } from 'sequelize'
import { Inject, Service } from 'typedi'
import { SubscriptionStatus } from '../domain/customer-subscription/subscription-state'
import { EmailTemplate } from '../email/email-library.interface'
import { EmailParam } from '../email/templates/email-param'
import { date15daysAfter, date15daysBefore } from '../helpers/date'
import {
  CreateCustomerSubscriptionDto,
  UpdateCustomerSubscriptionDto,
} from '../models/customer-subscription.dto'
import { CustomerRepository } from '../repositories/customer'
import { CustomerSubscriptionRepository } from '../repositories/customer-subscription'
import { SubscriptionRepository } from '../repositories/subscription'
import { CustomerSubscriptionService } from '../services/customer-subscription.service'

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
      return res.status(404).send({
        type: 'Not found',
        message: `Customer with id ${customerId} not found`,
      })
    }
    const customerSubscriptions =
      await this.repository.getAllByCustomer(customerId)
    res.status(200).send(customerSubscriptions)
  }

  async addSubscription(req: Request, res: Response) {
    const createCustomerSubscriptionDto: CreateCustomerSubscriptionDto =
      CreateCustomerSubscriptionDto.fromRequest(req.body)
    const hasErrors: ClassValidationError[] | null =
      await CreateCustomerSubscriptionDto.hasErrors(
        createCustomerSubscriptionDto,
      )

    if (hasErrors instanceof Array && hasErrors.length > 0) {
      return res.status(400).send({
        type: 'Invalid attribute(s)',
        message: ` ${(hasErrors as ClassValidationError[]).map((e) => e.property)}`,
      })
    }
    // Check if customer exists else throw an error
    const customer = await this.customerRepository.get(
      createCustomerSubscriptionDto.customerId,
    )
    if (!customer) {
      return res.status(404).send({
        type: 'Not found',
        message: `Customer with id ${createCustomerSubscriptionDto.customerId} not found`,
      })
    }
    // Check if there's already a subscription with startDate/endDate or create it
    let subscription =
      await this.subscriptionRepository.getByStartDateAndEndDate(
        createCustomerSubscriptionDto.startDate,
        createCustomerSubscriptionDto.endDate,
      )

    if (subscription) {
      const customerSubscriptions =
        await this.repository.getByCustomerAndSubscription(
          createCustomerSubscriptionDto.customerId,
          subscription.id as string,
        )
      // If it is associated to the same customer we should return an error
      if (customerSubscriptions?.[0]) {
        return res.status(409).send({
          type: 'Invalid attribute(s)',
          message: `Subscription with start date ${createCustomerSubscriptionDto.startDate} and end date ${createCustomerSubscriptionDto.endDate} already exists for customer ${createCustomerSubscriptionDto.customerId}`,
        })
      }
    } else {
      subscription = await this.subscriptionRepository.create({
        startDate: createCustomerSubscriptionDto.startDate,
        endDate: createCustomerSubscriptionDto.endDate,
      })
    }

    try {
      const customerSubscription = {
        ...createCustomerSubscriptionDto,
        subscriptionId: subscription.id as string,
      }
      const newCustomerSubscription = await this.repository.create(
        customerSubscription as CreateCustomerSubscriptionDto,
      )
      res.status(201).send(newCustomerSubscription)
    } catch (error: ValidationError | unknown) {
      res.status(400).send({
        type: 'Validation error',
        message: `${(error as ValidationError).errors?.[0]?.message}`,
      })
    }
  }

  async updateSubscription(req: Request, res: Response) {
    const updateCustomerSubscriptionDto: UpdateCustomerSubscriptionDto =
      UpdateCustomerSubscriptionDto.fromRequest(req.body)

    const hasErrors: ClassValidationError[] | null =
      await UpdateCustomerSubscriptionDto.hasErrors(
        updateCustomerSubscriptionDto,
      )

    if (hasErrors instanceof Array && hasErrors.length > 0) {
      return res.status(400).send({
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

  async deleteSubscription(req: Request, res: Response) {
    const customerId = req.query.customerId as string
    const subscriptionId = req.query.subscriptionId as string
    try {
      await this.repository.deleteCustomerSubscription(
        customerId,
        subscriptionId,
      )
      res.status(200).send({})
    } catch (error) {
      res.status(404).send({
        type: 'Non processable entity',
        message: `Unable to delete customer-subscription with customerId ${customerId} and subscriptionId ${subscriptionId}`,
      })
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
      } else {
        res.status(204).send()
      }
    } catch (error) {
      res.status(400).send({
        type: 'Validation error',
        message: error,
      })
    }
  }
}
