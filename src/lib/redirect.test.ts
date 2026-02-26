import { describe, it, expect } from 'vitest'

import { sanitizeRedirect } from './redirect'

describe('sanitizeRedirect', () => {
  it('allows simple relative paths', () => {
    expect(sanitizeRedirect('/dashboard')).toBe('/dashboard')
  })

  it('allows paths with query params', () => {
    expect(sanitizeRedirect('/notes?filter=shared')).toBe('/notes?filter=shared')
  })

  it('falls back for absolute URLs', () => {
    expect(sanitizeRedirect('https://evil.com')).toBe('/dashboard')
  })

  it('falls back for protocol-relative URLs', () => {
    expect(sanitizeRedirect('//evil.com')).toBe('/dashboard')
  })

  it('falls back for javascript: URLs', () => {
    expect(sanitizeRedirect('javascript:alert(1)')).toBe('/dashboard')
  })

  it('falls back for null/undefined/empty', () => {
    expect(sanitizeRedirect(null)).toBe('/dashboard')
    expect(sanitizeRedirect(undefined)).toBe('/dashboard')
    expect(sanitizeRedirect('')).toBe('/dashboard')
  })

  it('falls back for paths not starting with /', () => {
    expect(sanitizeRedirect('evil.com/path')).toBe('/dashboard')
  })

  it('allows custom fallback', () => {
    expect(sanitizeRedirect('https://evil.com', '/home')).toBe('/home')
  })
})
