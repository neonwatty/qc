import { describe, it, expect } from 'vitest'

import { optimizeForTouch, ensureTouchTarget } from '@/lib/touch-interactions'

describe('optimizeForTouch', () => {
  it('returns a cleanup function', () => {
    const el = document.createElement('div')
    const cleanup = optimizeForTouch(el)
    expect(typeof cleanup).toBe('function')
  })

  it('accepts options without throwing', () => {
    const el = document.createElement('div')
    expect(() => optimizeForTouch(el, { enableRipple: true, preventContextMenu: true })).not.toThrow()
  })

  it('cleanup function does not throw', () => {
    const el = document.createElement('div')
    const cleanup = optimizeForTouch(el)
    expect(() => cleanup()).not.toThrow()
  })
})

describe('ensureTouchTarget', () => {
  it('does not throw when called with an element', () => {
    const el = document.createElement('button')
    expect(() => ensureTouchTarget(el)).not.toThrow()
  })

  it('returns undefined', () => {
    const el = document.createElement('button')
    expect(ensureTouchTarget(el)).toBeUndefined()
  })
})
