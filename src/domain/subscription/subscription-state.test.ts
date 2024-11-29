import { processState, shouldTriggerProcess } from './subscription-state'

describe('shouldTriggerProcess', () => {
  it('should return false if subscriptionEndDate is udefined and state is undefined', () => {
    const result = shouldTriggerProcess(undefined, undefined)
    expect(result).toBe(false)
  })

  it('should return true if state is started', () => {
    const result = shouldTriggerProcess(undefined, 'started')
    expect(result).toBe(true)
  })

  it('should return true if state is lateExpired', () => {
    const result = shouldTriggerProcess(undefined, 'lateExpired')
    expect(result).toBe(true)
  })

  it('should return false if state is expiresSoon and there is no subscriptionEndDate', () => {
    const result = shouldTriggerProcess(undefined, 'expiresSoon')
    expect(result).toBe(false)
  })

  it('should return false if state is expired and there is no subscriptionEndDate', () => {
    const result = shouldTriggerProcess(undefined, 'expired')
    expect(result).toBe(false)
  })

  it('should return false if state is expiresSoon and there is a subscriptionEndDate but it is not today', () => {
    const result = shouldTriggerProcess('2022-01-01', 'expiresSoon')
    expect(result).toBe(false)
  })

  it('should return true if state is expired and there is a subscriptionEndDate but it is not today + 15', () => {
    const result = shouldTriggerProcess('2022-01-01', 'expired')
    expect(result).toBe(false)
  })
})

describe('processState', () => {
  it('should return ended for "started" status when there is a next subscription', () => {
    const result = processState('started', true)
    expect(result.nextState).toBe('ended')
    expect(result.template).not.toBeDefined()
  })

  it('should return expiresSoon nextState and template for "started" status when there is no next subscription', () => {
    const result = processState('started')
    expect(result.nextState).toBe('expiresSoon')
    expect(result.template).toBeDefined()
  })

  it('should return expired nextState and template for "expiresSoon" status', () => {
    const result = processState('expiresSoon')
    expect(result.nextState).toBe('expired')
    expect(result.template).toBeDefined()
  })

  it('should return lateExpired nextState and template for "expired" status', () => {
    const result = processState('expired')
    expect(result.nextState).toBe('lateExpired')
    expect(result.template).toBeDefined()
  })

  it('should not process for "lateExpired" status and when there is no next subscription', () => {
    const result = processState('lateExpired')
    expect(result).toBeUndefined()
  })

  it('should not process for "ended" status and when there is no next subscription', () => {
    const result = processState('ended')
    expect(result).toBeUndefined()
  })
})
