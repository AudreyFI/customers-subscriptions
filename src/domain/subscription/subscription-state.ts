import { EmailTemplate } from '../../email/email-library.interface'
import { EmailParam } from '../../email/templates/email-param'
import { expired } from '../../email/templates/expired'
import { lateExpired } from '../../email/templates/late-expired'
import { soonToExpire } from '../../email/templates/soon-to-expire'
import { date15daysAfter, date15daysBefore, today } from '../../helpers/date'
import { SubscriptionStatus } from './subscription-status'

type SubscriptionAction = 'sendAlert' | 'terminate'

type StateMachine = {
  [state in SubscriptionStatus]: {
    [action in SubscriptionAction]?: {
      nextState: SubscriptionStatus
      template?: (content: EmailParam) => EmailTemplate
    }
  }
}

const stateMachine: StateMachine = {
  started: {
    sendAlert: {
      nextState: 'expiresSoon',
      template: (content: EmailParam) => soonToExpire(content),
    },
    terminate: { nextState: 'ended' },
  },
  expiresSoon: {
    sendAlert: {
      nextState: 'expired',
      template: (content: EmailParam) => expired(content),
    },
    terminate: { nextState: 'ended' },
  },
  expired: {
    sendAlert: {
      nextState: 'lateExpired',
      template: (content: EmailParam) => lateExpired(content),
    },
    terminate: { nextState: 'ended' },
  },
  lateExpired: { terminate: { nextState: 'ended' } },
  ended: {},
}

export const shouldTriggerProcess = (
  subscriptionEndDate: string | undefined,
  state: SubscriptionStatus | undefined,
) => {
  return (
    state === 'started' || // because we only retrieve the subscriptionEndDate that are greater than today - 15 days
    (state === 'expiresSoon' &&
      subscriptionEndDate &&
      subscriptionEndDate >= date15daysBefore &&
      subscriptionEndDate <= today) ||
    (state === 'expired' &&
      subscriptionEndDate &&
      subscriptionEndDate > today &&
      subscriptionEndDate <= date15daysAfter()) ||
    state === 'lateExpired'
  )
}

export const processState = (
  status: SubscriptionStatus,
  hasNextSubscription = false,
): {
  nextState: SubscriptionStatus
  template?: (content: EmailParam) => EmailTemplate
} => {
  if (hasNextSubscription) {
    return stateMachine[status]['terminate'] as {
      nextState: SubscriptionStatus
      template?: (content: EmailParam) => EmailTemplate
    }
  }
  return stateMachine[status]['sendAlert'] as {
    nextState: SubscriptionStatus
    template?: (content: EmailParam) => EmailTemplate
  }
}
