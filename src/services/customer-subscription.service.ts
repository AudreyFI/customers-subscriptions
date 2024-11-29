import { Inject, Service } from 'typedi'
import { InvalidCustomerSubscription } from '../domain/customer-subscription/customer-subscription-data'
import { SubscriptionStatus } from '../domain/subscription/subscription-status'
import { EmailTemplate } from '../email/email-library.interface'
import { NodemailerLibrary } from '../email/nodemailer'
import { EmailParam } from '../email/templates/email-param'
import { UpdateCustomerSubscriptionDto } from '../models/customer-subscription.dto'
import { CustomerSubscriptionRepository } from '../repositories/customer-subscription'

@Service()
export class CustomerSubscriptionService {
  @Inject()
  emailService!: NodemailerLibrary
  @Inject()
  repository!: CustomerSubscriptionRepository
  constructor() {}

  async manageInvalidSubscriptionsFlow(
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
    invalidSubscriptions: InvalidCustomerSubscription[],
  ) {
    console.log(
      `Starting state machine process for ${invalidSubscriptions.length} invalid subscriptions`,
    )
    for (const invalidSubscription of invalidSubscriptions) {
      const subscription = invalidSubscription.subscription
      if (subscription) {
        const shouldProcessFlow = shouldTriggerProcess(
          subscription?.endDate,
          subscription?.status,
        )
        if (shouldProcessFlow) {
          const hasNextSubscription =
            await this.repository.hasNextSubscriptions(
              invalidSubscription.customerId as string,
              subscription.endDate,
            )
          const processFlow = processState(
            subscription.status,
            hasNextSubscription,
          )
          if (processFlow?.template) {
            await this.sendEmail(invalidSubscription, processFlow?.template)
          }
          return await this.updateSubscriptionStatus(
            invalidSubscription,
            processFlow?.nextState,
          )
        }
      }
    }
  }

  private getTemplate(
    templateFn: ((content: EmailParam) => EmailTemplate) | undefined,
    content: EmailParam,
  ) {
    if (!templateFn) {
      throw new Error(
        `Template not found for the given CustomerSubscription for ${content.firstname} ${content.lastname}`,
      )
    }
    return templateFn(content)
  }

  private async sendEmail(
    invalidSubscription: InvalidCustomerSubscription,
    templateFn: ((content: EmailParam) => EmailTemplate) | undefined,
  ) {
    const emailParam: EmailParam = {
      lastname: invalidSubscription.lastname as string,
      firstname: invalidSubscription.firstname as string,
      endDate: invalidSubscription.subscription.endDate,
    }
    const template = this.getTemplate(templateFn, emailParam)
    this.emailService.sendEmail({ email: invalidSubscription.email, template })
  }

  private async updateSubscriptionStatus(
    invalidSubscription: InvalidCustomerSubscription,
    nextState: SubscriptionStatus | undefined,
  ) {
    if (!nextState) {
      throw new Error(
        `NextState not found for the given subscriptionId ${invalidSubscription.subscription.id} and customerId ${invalidSubscription.customerId}`,
      )
    }
    const updateCustomerSubscription: UpdateCustomerSubscriptionDto = {
      customerId: invalidSubscription.customerId,
      subscriptionId: invalidSubscription.subscription.id,
      status: nextState,
    }
    return this.repository.update(updateCustomerSubscription)
  }
}
