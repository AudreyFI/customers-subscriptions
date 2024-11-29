import 'reflect-metadata'
import { Container } from 'typedi'
import { InvalidCustomerSubscription } from '../domain/customer-subscription/customer-subscription-data'
import { NodemailerLibrary } from '../email/nodemailer'
import { date15daysAfter, date15daysBefore, today } from '../helpers/date'
import { CustomerSubscriptionRepository } from '../repositories/customer-subscription'
import { CustomerSubscriptionService } from './customer-subscription.service'

jest.mock('../email/nodemailer')
jest.mock('../repositories/customer-subscription')

describe('CustomerSubscriptionService', () => {
  let service: CustomerSubscriptionService
  let emailService: NodemailerLibrary
  let repository: CustomerSubscriptionRepository

  beforeEach(() => {
    Container.reset()
    emailService = new NodemailerLibrary()
    repository = new CustomerSubscriptionRepository()
    Container.set(NodemailerLibrary, emailService)
    Container.set(CustomerSubscriptionRepository, repository)
    service = Container.get(CustomerSubscriptionService)
  })

  describe('getTemplate', () => {
    it('should return the template when templateFn is defined', () => {
      const content = {
        lastname: 'Doe',
        firstname: 'John',
        endDate: '2023-10-01',
      }
      const templateFn = jest
        .fn()
        .mockReturnValue({ subject: 'Test', body: 'Test' })

      const result = service['getTemplate'](templateFn, content)

      expect(templateFn).toHaveBeenCalledWith(content)
      expect(result).toEqual({ subject: 'Test', body: 'Test' })
    })

    it('should throw an error when templateFn is undefined', () => {
      const content = {
        lastname: 'Doe',
        firstname: 'John',
        endDate: '2023-10-01',
      }

      expect(() => service['getTemplate'](undefined, content)).toThrow(
        'Template not found for the given CustomerSubscription for John Doe',
      )
    })
  })

  describe('sendEmail', () => {
    it('should send email with correct template', async () => {
      const invalidSubscription: InvalidCustomerSubscription = {
        customerId: 'customer1',
        subscription: {
          id: 'sub1',
          startDate: '2023-09-01',
          endDate: '2023-10-01',
          status: 'ended',
        },
        email: 'test@example.com',
        firstname: 'John',
        lastname: 'Doe',
      }

      const templateFn = jest
        .fn()
        .mockReturnValue({ subject: 'Test', body: 'Test' })
      emailService.sendEmail = jest.fn().mockResolvedValue(true)

      await service['sendEmail'](invalidSubscription, templateFn)

      expect(templateFn).toHaveBeenCalledWith({
        lastname: 'Doe',
        firstname: 'John',
        endDate: '2023-10-01',
      })
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        template: { subject: 'Test', body: 'Test' },
      })
    })
  })

  describe('updateSubscriptionStatus', () => {
    it('should update subscription status', async () => {
      const invalidSubscription: InvalidCustomerSubscription = {
        customerId: 'customer1',
        subscription: {
          id: 'sub1',
          startDate: '2023-09-01',
          endDate: '2023-10-01',
          status: 'ended',
        },
        email: 'test@example.com',
        firstname: 'John',
        lastname: 'Doe',
      }

      repository.update = jest.fn().mockResolvedValue(true)

      await service['updateSubscriptionStatus'](invalidSubscription, 'started')

      expect(repository.update).toHaveBeenCalledWith({
        customerId: 'customer1',
        subscriptionId: 'sub1',
        status: 'started',
      })
    })

    it('should throw error if nextState is undefined', async () => {
      const invalidSubscription: InvalidCustomerSubscription = {
        customerId: 'customer1',
        subscription: {
          id: 'sub1',
          startDate: '2023-09-01',
          endDate: '2023-10-01',
          status: 'ended',
        },
        email: 'test@example.com',
        firstname: 'John',
        lastname: 'Doe',
      }

      await expect(
        service['updateSubscriptionStatus'](invalidSubscription, undefined),
      ).rejects.toThrow(
        'NextState not found for the given subscriptionId sub1 and customerId customer1',
      )
    })
  })

  describe('manageInvalidSubscriptionsFlow', () => {
    it('should process invalid subscriptions and send email when subscription expires soon', async () => {
      const invalidSubscriptions: InvalidCustomerSubscription[] = [
        {
          customerId: 'customer1',
          subscription: {
            id: 'sub1',
            startDate: '2023-09-01',
            endDate: date15daysAfter(),
            status: 'started',
          },
          email: 'test@example.com',
          firstname: 'John',
          lastname: 'Doe',
        },
      ]

      const processState = jest.fn().mockReturnValue({
        nextState: 'expiresSoon',
        template: jest.fn().mockReturnValue({ subject: 'Test', body: 'Test' }),
      })

      const shouldTriggerProcess = jest.fn().mockReturnValue(true)
      repository.hasNextSubscriptions = jest.fn().mockResolvedValue(false)
      repository.update = jest.fn().mockResolvedValue(true)
      emailService.sendEmail = jest.fn().mockResolvedValue(true)

      await service.manageInvalidSubscriptionsFlow(
        processState,
        shouldTriggerProcess,
        invalidSubscriptions,
      )

      expect(shouldTriggerProcess).toHaveBeenCalledWith(
        date15daysAfter(),
        'started',
      )
      expect(processState).toHaveBeenCalledWith('started', false)
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        template: { subject: 'Test', body: 'Test' },
      })
      expect(repository.update).toHaveBeenCalledWith({
        customerId: 'customer1',
        subscriptionId: 'sub1',
        status: 'expiresSoon',
      })
    })

    it('should not send email and set status to ended when user has a new subscription', async () => {
      const invalidSubscriptions: InvalidCustomerSubscription[] = [
        {
          customerId: 'customer1',
          subscription: {
            id: 'sub1',
            startDate: '2023-09-01',
            endDate: date15daysAfter(),
            status: 'started',
          },
          email: 'test@example.com',
          firstname: 'John',
          lastname: 'Doe',
        },
      ]

      const processState = jest.fn().mockReturnValue({
        nextState: 'ended',
      })

      const shouldTriggerProcess = jest.fn().mockReturnValue(true)
      repository.hasNextSubscriptions = jest.fn().mockResolvedValue(true)
      repository.update = jest.fn().mockResolvedValue(true)

      await service.manageInvalidSubscriptionsFlow(
        processState,
        shouldTriggerProcess,
        invalidSubscriptions,
      )

      expect(shouldTriggerProcess).toHaveBeenCalledWith(
        date15daysAfter(),
        'started',
      )
      expect(processState).toHaveBeenCalledWith('started', true)
      expect(emailService.sendEmail).not.toHaveBeenCalled()
      expect(repository.update).toHaveBeenCalledWith({
        customerId: 'customer1',
        subscriptionId: 'sub1',
        status: 'ended',
      })
    })

    it('should process invalid subscriptions and send email when subscription expires', async () => {
      const invalidSubscriptions: InvalidCustomerSubscription[] = [
        {
          customerId: 'customer1',
          subscription: {
            id: 'sub1',
            startDate: '2023-09-01',
            endDate: today,
            status: 'expiresSoon',
          },
          email: 'test@example.com',
          firstname: 'John',
          lastname: 'Doe',
        },
      ]

      const processState = jest.fn().mockReturnValue({
        nextState: 'expired',
        template: jest.fn().mockReturnValue({ subject: 'Test', body: 'Test' }),
      })

      const shouldTriggerProcess = jest.fn().mockReturnValue(true)
      repository.hasNextSubscriptions = jest.fn().mockResolvedValue(false)
      repository.update = jest.fn().mockResolvedValue(true)
      emailService.sendEmail = jest.fn().mockResolvedValue(true)

      await service.manageInvalidSubscriptionsFlow(
        processState,
        shouldTriggerProcess,
        invalidSubscriptions,
      )

      expect(shouldTriggerProcess).toHaveBeenCalledWith(today, 'expiresSoon')
      expect(processState).toHaveBeenCalledWith('expiresSoon', false)
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        template: { subject: 'Test', body: 'Test' },
      })
      expect(repository.update).toHaveBeenCalledWith({
        customerId: 'customer1',
        subscriptionId: 'sub1',
        status: 'expired',
      })
    })

    it('should process invalid subscriptions and send email when subscription is late expired', async () => {
      const invalidSubscriptions: InvalidCustomerSubscription[] = [
        {
          customerId: 'customer1',
          subscription: {
            id: 'sub1',
            startDate: '2023-09-01',
            endDate: date15daysBefore,
            status: 'expired',
          },
          email: 'test@example.com',
          firstname: 'John',
          lastname: 'Doe',
        },
      ]

      const processState = jest.fn().mockReturnValue({
        nextState: 'lateExpired',
        template: jest.fn().mockReturnValue({ subject: 'Test', body: 'Test' }),
      })

      const shouldTriggerProcess = jest.fn().mockReturnValue(true)
      repository.hasNextSubscriptions = jest.fn().mockResolvedValue(false)
      repository.update = jest.fn().mockResolvedValue(true)
      emailService.sendEmail = jest.fn().mockResolvedValue(true)

      await service.manageInvalidSubscriptionsFlow(
        processState,
        shouldTriggerProcess,
        invalidSubscriptions,
      )

      expect(shouldTriggerProcess).toHaveBeenCalledWith(
        date15daysBefore,
        'expired',
      )
      expect(processState).toHaveBeenCalledWith('expired', false)
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        template: { subject: 'Test', body: 'Test' },
      })
      expect(repository.update).toHaveBeenCalledWith({
        customerId: 'customer1',
        subscriptionId: 'sub1',
        status: 'lateExpired',
      })
    })

    it('should not process if the status is ended', async () => {
      const invalidSubscriptions: InvalidCustomerSubscription[] = [
        {
          customerId: 'customer1',
          subscription: {
            id: 'sub1',
            startDate: '2023-09-01',
            endDate: '2023-10-01',
            status: 'ended',
          },
          email: 'test@example.com',
          firstname: 'John',
          lastname: 'Doe',
        },
      ]

      const processState = jest.fn()
      const shouldTriggerProcess = jest.fn().mockReturnValue(false)

      await service.manageInvalidSubscriptionsFlow(
        processState,
        shouldTriggerProcess,
        invalidSubscriptions,
      )

      expect(shouldTriggerProcess).toHaveBeenCalledWith('2023-10-01', 'ended')
      expect(processState).not.toHaveBeenCalled()
    })
  })
})
