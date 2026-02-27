import { describe, it, expect, afterEach } from 'vitest'

import { isNativePlatform } from '@/lib/capacitor'

describe('isNativePlatform', () => {
  const originalNavigator = globalThis.navigator

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    })
  })

  it('returns false for standard browser userAgent', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
      writable: true,
      configurable: true,
    })
    expect(isNativePlatform()).toBe(false)
  })

  it('returns true when userAgent contains QCCapacitor', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Mobile/15E148 QCCapacitor',
      },
      writable: true,
      configurable: true,
    })
    expect(isNativePlatform()).toBe(true)
  })

  it('returns true when QCCapacitor appears mid-string', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        userAgent: 'SomePrefix QCCapacitor SomeSuffix',
      },
      writable: true,
      configurable: true,
    })
    expect(isNativePlatform()).toBe(true)
  })
})
