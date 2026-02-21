import { describe, it, expect } from 'vitest'
import { WARMUP_PROMPTS, pickThreePrompts } from './warmup-prompts'

describe('warmup-prompts', () => {
  it('has prompts for all three tones', () => {
    const tones = new Set(WARMUP_PROMPTS.map((p) => p.tone))
    expect(tones).toEqual(new Set(['light', 'medium', 'deep']))
  })

  it('has at least 5 prompts per tone', () => {
    const counts: Record<string, number> = {}
    for (const p of WARMUP_PROMPTS) {
      counts[p.tone] = (counts[p.tone] ?? 0) + 1
    }
    expect(counts['light']).toBeGreaterThanOrEqual(5)
    expect(counts['medium']).toBeGreaterThanOrEqual(5)
    expect(counts['deep']).toBeGreaterThanOrEqual(5)
  })

  it('has unique IDs', () => {
    const ids = WARMUP_PROMPTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('pickThreePrompts returns one from each tone', () => {
    const picked = pickThreePrompts(42)
    expect(picked).toHaveLength(3)
    const tones = picked.map((p) => p.tone)
    expect(tones).toContain('light')
    expect(tones).toContain('medium')
    expect(tones).toContain('deep')
  })

  it('pickThreePrompts is deterministic with seed', () => {
    const a = pickThreePrompts(7)
    const b = pickThreePrompts(7)
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id))
  })
})
