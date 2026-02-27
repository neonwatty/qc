import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/capacitor', () => ({
  isNativePlatform: vi.fn(() => false),
}))

import { hapticFeedback, withHaptic, createHapticHandler, useHapticFeedback } from './haptics'
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
// hapticFeedback presets
// ---------------------------------------------------------------------------

describe('hapticFeedback', () => {
  it('tap triggers light vibration', () => {
    hapticFeedback.tap()
    expect(vibrateSpy).toHaveBeenCalledWith(10)
  })

  it('success triggers success notification pattern', () => {
    hapticFeedback.success()
    expect(vibrateSpy).toHaveBeenCalledWith([50, 50, 50])
  })

  it('error triggers error notification pattern', () => {
    hapticFeedback.error()
    expect(vibrateSpy).toHaveBeenCalledWith([150, 100, 150, 100, 150])
  })

  it('warning triggers warning notification pattern', () => {
    hapticFeedback.warning()
    expect(vibrateSpy).toHaveBeenCalledWith([100, 50, 100])
  })

  it('checkInComplete triggers success notification', () => {
    hapticFeedback.checkInComplete()
    expect(vibrateSpy).toHaveBeenCalledWith([50, 50, 50])
  })

  it('noteAdded triggers light vibration', () => {
    hapticFeedback.noteAdded()
    expect(vibrateSpy).toHaveBeenCalledWith(10)
  })
})

// ---------------------------------------------------------------------------
// withHaptic
// ---------------------------------------------------------------------------

describe('withHaptic', () => {
  it('triggers haptic and calls the wrapped handler', () => {
    const handler = vi.fn(() => 42)
    const wrapped = withHaptic(handler, 'medium')
    const result = wrapped()
    expect(vibrateSpy).toHaveBeenCalledWith(50)
    expect(handler).toHaveBeenCalled()
    expect(result).toBe(42)
  })

  it('defaults to light intensity', () => {
    const handler = vi.fn()
    const wrapped = withHaptic(handler)
    wrapped()
    expect(vibrateSpy).toHaveBeenCalledWith(10)
  })

  it('passes arguments through to the handler', () => {
    const handler = vi.fn((a: unknown, b: unknown) => `${a}-${b}`)
    const wrapped = withHaptic(handler, 'heavy')
    const result = wrapped('x', 'y')
    expect(result).toBe('x-y')
    expect(handler).toHaveBeenCalledWith('x', 'y')
  })
})

// ---------------------------------------------------------------------------
// createHapticHandler
// ---------------------------------------------------------------------------

describe('createHapticHandler', () => {
  it('triggers haptic and calls the event handler', () => {
    const handler = vi.fn()
    const event = new MouseEvent('click')
    const wrapped = createHapticHandler<MouseEvent>(handler, 'heavy')
    wrapped(event)
    expect(vibrateSpy).toHaveBeenCalledWith(100)
    expect(handler).toHaveBeenCalledWith(event)
  })

  it('defaults to light intensity', () => {
    const handler = vi.fn()
    const event = new MouseEvent('click')
    const wrapped = createHapticHandler<MouseEvent>(handler)
    wrapped(event)
    expect(vibrateSpy).toHaveBeenCalledWith(10)
  })
})

// ---------------------------------------------------------------------------
// useHapticFeedback
// ---------------------------------------------------------------------------

describe('useHapticFeedback', () => {
  it('returns isSupported, trigger, triggerPattern, and feedback', () => {
    const result = useHapticFeedback()
    expect(result.isSupported).toBe(true)
    expect(typeof result.trigger).toBe('function')
    expect(typeof result.triggerPattern).toBe('function')
    expect(typeof result.feedback.tap).toBe('function')
  })

  it('reports not supported when vibrate is missing', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    const result = useHapticFeedback()
    expect(result.isSupported).toBe(false)
  })
})
