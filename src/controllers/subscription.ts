import { Request, Response } from 'express'
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from '../models/subscription.dto'
import { convertPeriodToEndDate } from '../helpers/date'
import { Inject, Service } from 'typedi'
import { SubscriptionRepository } from '../repositories/subscription'
import { ValidationError as ClassValidationError } from 'class-validator'
import { ValidationError } from 'sequelize'
import { subscription } from '../models/subscription.model'

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
      res.status(404).send(`Subscription with id ${id} not found`)
    } else {
      res.status(200).send(subscription)
    }
  }

  async create(req: Request, res: Response) {
    const createSubscriptionDto: Partial<CreateSubscriptionDto> =
      CreateSubscriptionDto.fromRequest(req.body)
    const hasErrors: ClassValidationError[] | null =
      await CreateSubscriptionDto.hasErrors(
        createSubscriptionDto as CreateSubscriptionDto,
      )

    if (hasErrors instanceof Array && hasErrors.length > 0) {
      res.status(400).send({
        message: `Invalid attribute(s): ${(hasErrors as ClassValidationError[]).map((e) => e.property)}`,
      })
    } else {
      req.body.endDate = convertPeriodToEndDate(
        req.body.startDate,
        req.body.type,
      )
      delete req.body.type
      // Check if there's already a combo startDate/endDate
      const existingSubscription =
        await this.repository.getByStartDateAndEndDate(
          req.body.startDate,
          req.body.endDate,
        )
      if (existingSubscription) {
        res.status(400).send({
          message: `Subscription with start date ${req.body.startDate} and end date ${req.body.endDate} already exists`,
        })
      } else {
        try {
          const body = await this.repository.create(req.body)
          res.status(201).send(body)
        } catch (error: ValidationError | unknown) {
          res
            .status(404)
            .send(
              `Validation error: ${(error as ValidationError).errors?.[0]?.message}`,
            )
        }
      }
    }
  }

  async update(req: Request, res: Response) {
    const hasErrors: ClassValidationError[] | null =
      await UpdateSubscriptionDto.hasErrors(
        UpdateSubscriptionDto.fromRequest(req.body),
      )

    if (hasErrors instanceof Array && hasErrors.length > 0) {
      res.status(400).send({
        message: `Invalid attribute(s): ${(hasErrors as ClassValidationError[]).map((e) => e.property)}`,
      })
    }

    const existingSubscription = await subscription.findByPk(req.body.id)
    if (!existingSubscription) {
      res
        .status(404)
        .send({ message: `Subscription with id ${req.body.id} not found` })
    }

    req.body.endDate = convertPeriodToEndDate(req.body.startDate, req.body.type)
    // Check if there's already a combo startDate/endDate
    const existingSubscriptionByDates = await subscription.findOne({
      where: { startDate: req.body.startDate, endDate: req.body.endDate },
    })
    if (existingSubscriptionByDates) {
      res.status(400).send({
        message: `Subscription with start date ${req.body.startDate} and end date ${req.body.endDate} already exists`,
      })
    }
    try {
      await this.repository.update(req.body)
      res.status(200).send(req.body)
    } catch (error) {
      res
        .status(404)
        .send(
          `Validation error: ${(error as ValidationError).errors?.[0]?.message}`,
        )
    }
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id
    try {
      await this.repository.delete(id)
      res.status(200).send({})
    } catch (error) {
      console.error(`Unable to delete subscription with id ${id}`)
    }
  }
}
