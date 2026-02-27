import { describe, it, expect } from 'vitest'

import { INITIAL_FORM, CATEGORY_OPTIONS, RARITY_OPTIONS } from './milestone-creator-config'

describe('INITIAL_FORM', () => {
  it('has correct default values', () => {
    expect(INITIAL_FORM.title).toBe('')
    expect(INITIAL_FORM.description).toBe('')
    expect(INITIAL_FORM.category).toBe('')
    expect(INITIAL_FORM.icon).toBe('')
    expect(INITIAL_FORM.photoFile).toBeNull()
    expect(INITIAL_FORM.rarity).toBe('common')
    expect(INITIAL_FORM.points).toBe(10)
  })
})

describe('CATEGORY_OPTIONS', () => {
  it('has 7 categories', () => {
    expect(CATEGORY_OPTIONS).toHaveLength(7)
  })

  it('each option has required fields', () => {
    for (const opt of CATEGORY_OPTIONS) {
      expect(opt.id).toBeDefined()
      expect(opt.name).toBeDefined()
      expect(opt.icon).toBeDefined()
      expect(opt.color).toBeDefined()
      expect(opt.bgColor).toBeDefined()
      expect(opt.description).toBeDefined()
    }
  })

  it('includes all category IDs', () => {
    const ids = CATEGORY_OPTIONS.map((o) => o.id)
    expect(ids).toContain('communication')
    expect(ids).toContain('intimacy')
    expect(ids).toContain('growth')
    expect(ids).toContain('relationship')
    expect(ids).toContain('adventure')
    expect(ids).toContain('milestone')
    expect(ids).toContain('custom')
  })
})

describe('RARITY_OPTIONS', () => {
  it('has 4 rarities', () => {
    expect(RARITY_OPTIONS).toHaveLength(4)
  })

  it('includes all rarity IDs', () => {
    const ids = RARITY_OPTIONS.map((o) => o.id)
    expect(ids).toContain('common')
    expect(ids).toContain('rare')
    expect(ids).toContain('epic')
    expect(ids).toContain('legendary')
  })
})
