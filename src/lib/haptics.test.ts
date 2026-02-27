import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/capacitor', () => ({
  isNativePlatform: vi.fn(() => false),
}))

import { HAPTIC_PATTERNS, isHapticSupported, triggerHaptic, triggerHapticPattern } from './haptics'
import { isNativePlatform } from '@/lib/capacitor'

const mockIsNative = vi.mocked(isNativePlatform)
let vibrateSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  vibrateSpy = vi.fn(() => true)
  Object.defineProperty(navigator, 'vibrate', {
    value: vibrateSpy,
    writable: true,
    configurable: true,
  })
  mockIsNative.mockReturnValue(false)
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// HAPTIC_PATTERNS constants
// ---------------------------------------------------------------------------

describe('HAPTIC_PATTERNS', () => {
  it('has numeric values for simple patterns', () => {
    expect(HAPTIC_PATTERNS.light).toBe(10)
    expect(HAPTIC_PATTERNS.medium).toBe(50)
    expect(HAPTIC_PATTERNS.heavy).toBe(100)
    expect(HAPTIC_PATTERNS.tap).toBe(10)
    expect(HAPTIC_PATTERNS.swipe).toBe(15)
    expect(HAPTIC_PATTERNS.noteAdded).toBe(30)
  })

  it('has array values for complex patterns', () => {
    expect(HAPTIC_PATTERNS.success).toEqual([50, 50, 50])
    expect(HAPTIC_PATTERNS.error).toEqual([150, 100, 150, 100, 150])
    expect(HAPTIC_PATTERNS.checkInComplete).toEqual([100, 50, 100, 50, 200])
    expect(HAPTIC_PATTERNS.milestoneReached).toEqual([100, 100, 100, 100, 100])
  })
})

// ---------------------------------------------------------------------------
// isHapticSupported
// ---------------------------------------------------------------------------

describe('isHapticSupported', () => {
  it('returns true when navigator.vibrate exists', () => {
    expect(isHapticSupported()).toBe(true)
  })

  it('returns true when running on native platform', () => {
    mockIsNative.mockReturnValue(true)
    expect(isHapticSupported()).toBe(true)
  })

  it('returns false when vibrate is not a function', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    expect(isHapticSupported()).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// triggerHaptic
// ---------------------------------------------------------------------------

describe('triggerHaptic', () => {
  it('calls navigator.vibrate with light pattern', () => {
    triggerHaptic('light')
    expect(vibrateSpy).toHaveBeenCalledWith(10)
  })

  it('calls navigator.vibrate with medium pattern', () => {
    triggerHaptic('medium')
    expect(vibrateSpy).toHaveBeenCalledWith(50)
  })

  it('calls navigator.vibrate with heavy pattern', () => {
    triggerHaptic('heavy')
    expect(vibrateSpy).toHaveBeenCalledWith(100)
  })

  it('does not call vibrate when unsupported', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    triggerHaptic('light')
    expect(vibrateSpy).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// triggerHapticPattern
// ---------------------------------------------------------------------------

describe('triggerHapticPattern', () => {
  it('calls navigator.vibrate with a numeric pattern', () => {
    triggerHapticPattern(75)
    expect(vibrateSpy).toHaveBeenCalledWith(75)
  })

  it('calls navigator.vibrate with an array pattern', () => {
    triggerHapticPattern([100, 50, 100])
    expect(vibrateSpy).toHaveBeenCalledWith([100, 50, 100])
  })

  it('does not call vibrate when unsupported', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    triggerHapticPattern(50)
    expect(vibrateSpy).not.toHaveBeenCalled()
  })
})
