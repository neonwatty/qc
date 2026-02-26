import { describe, it, expect, vi, afterEach } from 'vitest'

import { createRateLimiter } from './rate-limit'

describe('createRateLimiter', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests under the limit', () => {
    const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 })
    for (let i = 0; i < 5; i++) {
      expect(limiter.check('key1')).toBe(true)
    }
  })

  it('blocks requests over the limit', () => {
    const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60_000 })
    expect(limiter.check('key1')).toBe(true)
    expect(limiter.check('key1')).toBe(true)
    expect(limiter.check('key1')).toBe(true)
    expect(limiter.check('key1')).toBe(false)
  })

  it('resets after window expires', () => {
    vi.useFakeTimers()
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 1000 })
    expect(limiter.check('key1')).toBe(true)
    expect(limiter.check('key1')).toBe(false)
    vi.advanceTimersByTime(1001)
    expect(limiter.check('key1')).toBe(true)
  })

  it('tracks keys independently', () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000 })
    expect(limiter.check('key1')).toBe(true)
    expect(limiter.check('key2')).toBe(true)
    expect(limiter.check('key1')).toBe(false)
  })
})
