import { EmailTemplate } from '../../email/email-library.interface'
import { EmailParam } from '../../email/templates/email-param'
import { expired } from '../../email/templates/expired'
import { lateExpired } from '../../email/templates/late-expired'
import { soonToExpire } from '../../email/templates/soon-to-expire'
import { date15daysAfter, today } from '../../helpers/date'

export type SubscriptionStatus =
  | 'started'
  | 'expiresSoon'
  | 'expired'
  | 'lateExpired'
  | 'ended'

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
  lateExpired: {},
  ended: {},
}

export const shouldTriggerProcess = (
  subscriptionEndDate: string | undefined,
  state: SubscriptionStatus | undefined,
) => {
  return (
    state === 'started' ||
    (state === 'expiresSoon' && subscriptionEndDate === today) ||
    (state === 'expired' &&
      subscriptionEndDate &&
      today === date15daysAfter(new Date(subscriptionEndDate))) ||
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
