import { ValidationError as ClassValidationError } from 'class-validator'
import { Request, Response } from 'express'
import { ValidationError } from 'sequelize'
import { Inject, Service } from 'typedi'
import { SubscriptionDto } from '../models/subscription.dto'
import { SubscriptionRepository } from '../repositories/subscription'

@Service()
export class SubscriptionController {
  @Inject()
  repository!: SubscriptionRepository

  async getAll(req: Request, res: Response) {
    const subscriptions = await this.repository.getAll()
    res.status(200).send(subscriptions)
  }

  async get(req: Request, res: Response) {
    const id = req.params.id
    const subscription = await this.repository.get(id)
    if (!subscription) {
      res
        .status(404)
        .send({
          type: 'Not found',
          message: `Subscription with id ${id} not found`,
        })
    } else {
      res.status(200).send(subscription)
    }
  }

  async create(req: Request, res: Response) {
    const createSubscriptionDto: Partial<SubscriptionDto> =
      SubscriptionDto.fromRequest(req.body)
    const hasErrors: ClassValidationError[] | null =
      await SubscriptionDto.hasErrors(createSubscriptionDto as SubscriptionDto)

    if (hasErrors instanceof Array && hasErrors.length > 0) {
      res.status(400).send({
        type: 'Invalid attribute(s)',
        message: `${(hasErrors as ClassValidationError[]).map((e) => e.property)}`,
      })
    } else {
      // Check if there's already a combo startDate/endDate
      const existingSubscription =
        await this.repository.getByStartDateAndEndDate(
          createSubscriptionDto.startDate as string,
          createSubscriptionDto.endDate as string,
        )
      if (existingSubscription) {
        res.status(409).send({
          type: 'Invalid attribute(s)',
          message: `Subscription with start date ${createSubscriptionDto.startDate} and end date ${createSubscriptionDto.endDate} already exists`,
        })
      } else {
        try {
          const body = await this.repository.create(req.body)
          res.status(201).send(body)
        } catch (error: ValidationError | unknown) {
          res.status(404).send({
            type: `Validation error`,
            message: `${(error as ValidationError).errors?.[0]?.message}`,
          })
        }
      }
    }
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id
    try {
      await this.repository.delete(id)
      res.status(200).send({})
    } catch (error) {
      res.status(400).send({
        type: 'Non processable entity',
        message: `Unable to delete subscription with id ${id}`,
      })
      console.error(`Unable to delete subscription with id ${id}`)
    }
  }
}
