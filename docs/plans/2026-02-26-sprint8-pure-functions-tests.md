# Sprint 8: Pure Function & Scoring Tests

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add unit tests for pure utility functions — text formatting (219 lines), streak calculations (152 lines), and growth scoring (141 lines). ~28 new tests bringing total to ~583.

**Architecture:** All targets are pure functions or take supabase as a parameter. No vi.mock needed for most tests. Split text-formatting into 2 files to stay under 150-line limit.

**Tech Stack:** Vitest

---

### Task 1: Text Formatting — applyFormat & removeFormat Tests

**Files:**

- Create: `src/lib/text-formatting.test.ts`
- Source: `src/lib/text-formatting.ts` (lines 28-111)

**Context:**
`applyFormat(text, start, end, format)` wraps the selected text range with markdown syntax and returns `{ text, markdown }`. `removeFormat(text, start, end)` strips all markdown/HTML formatting from the selection. Both are pure functions with no dependencies.

**Step 1: Write the tests**

```typescript
import { describe, it, expect } from 'vitest'
import { applyFormat, removeFormat } from './text-formatting'

describe('applyFormat', () => {
  it('applies bold formatting', () => {
    const result = applyFormat('hello world', 0, 5, { bold: true })
    expect(result.text).toBe('**hello** world')
    expect(result.markdown).toBe('**hello**')
  })

  it('applies italic formatting', () => {
    const result = applyFormat('hello world', 6, 11, { italic: true })
    expect(result.text).toBe('hello *world*')
  })

  it('applies heading formatting', () => {
    const result = applyFormat('Title', 0, 5, { heading: 2 })
    expect(result.markdown).toBe('## Title')
  })

  it('applies bullet list formatting', () => {
    const result = applyFormat('a\nb', 0, 3, { list: 'bullet' })
    expect(result.markdown).toBe('- a\n- b')
  })

  it('applies link formatting', () => {
    const result = applyFormat('click here', 0, 10, { link: 'https://example.com' })
    expect(result.markdown).toBe('[click here](https://example.com)')
  })

  it('applies blockquote formatting', () => {
    const result = applyFormat('quote', 0, 5, { blockquote: true })
    expect(result.markdown).toBe('> quote')
  })

  it('combines bold and italic', () => {
    const result = applyFormat('text', 0, 4, { bold: true, italic: true })
    expect(result.markdown).toBe('***text***')
  })
})

describe('removeFormat', () => {
  it('removes bold markdown', () => {
    expect(removeFormat('**bold** text', 0, 8)).toBe('bold text')
  })

  it('removes all formatting types', () => {
    const input = '**bold** *italic* ~~strike~~ [link](url)'
    const result = removeFormat(input, 0, input.length)
    expect(result).toContain('bold')
    expect(result).toContain('italic')
    expect(result).toContain('strike')
    expect(result).toContain('link')
    expect(result).not.toContain('**')
    expect(result).not.toContain('~~')
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/lib/text-formatting.test.ts`
Expected: 9 tests pass

**Step 3: Commit**

```bash
git add src/lib/text-formatting.test.ts
git commit -m "test: add text formatting applyFormat and removeFormat tests"
```

---

### Task 2: Text Formatting — Utilities Tests

**Files:**

- Create: `src/lib/text-formatting-utils.test.ts`
- Source: `src/lib/text-formatting.ts` (lines 116-219)

**Context:**
Pure utility functions: `toPlainText` strips all formatting, `toHTML` converts markdown to HTML, `countCharacters/countWords/countLines` count text metrics, `validateLength` checks min/max bounds, `sanitizeText` strips dangerous HTML (script, iframe, event handlers, javascript: URIs).

**Step 1: Write the tests**

```typescript
import { describe, it, expect } from 'vitest'
import {
  toPlainText,
  toHTML,
  countCharacters,
  countWords,
  countLines,
  validateLength,
  sanitizeText,
} from './text-formatting'

describe('toPlainText', () => {
  it('strips all markdown formatting', () => {
    expect(toPlainText('**bold** *italic* ~~strike~~')).toBe('bold italic strike')
  })

  it('strips HTML tags', () => {
    expect(toPlainText('<u>underlined</u>')).toBe('underlined')
  })
})

describe('toHTML', () => {
  it('converts bold and italic to HTML tags', () => {
    const html = toHTML('**bold** *italic*')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<em>italic</em>')
  })

  it('converts headings', () => {
    expect(toHTML('## Heading')).toContain('<h2>Heading</h2>')
  })
})

describe('countCharacters', () => {
  it('counts all characters including spaces', () => {
    expect(countCharacters('hello world')).toBe(11)
  })

  it('excludes spaces when flag is true', () => {
    expect(countCharacters('hello world', true)).toBe(10)
  })
})

describe('countWords', () => {
  it('counts words separated by spaces', () => {
    expect(countWords('hello beautiful world')).toBe(3)
  })

  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0)
  })
})

describe('countLines', () => {
  it('counts newline-separated lines', () => {
    expect(countLines('a\nb\nc')).toBe(3)
  })

  it('returns 0 for empty string', () => {
    expect(countLines('')).toBe(0)
  })
})

describe('validateLength', () => {
  it('returns valid when within bounds', () => {
    expect(validateLength('hello', 1, 10)).toEqual({ valid: true })
  })

  it('returns invalid when below minimum', () => {
    const result = validateLength('hi', 5)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('at least 5')
  })

  it('returns invalid when above maximum', () => {
    const result = validateLength('hello world', undefined, 5)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('no more than 5')
  })
})

describe('sanitizeText', () => {
  it('removes script tags', () => {
    expect(sanitizeText('hi<script>alert("xss")</script>there')).toBe('hithere')
  })

  it('removes javascript: URIs', () => {
    expect(sanitizeText('javascript:alert(1)')).not.toContain('javascript:')
  })

  it('removes event handlers', () => {
    expect(sanitizeText('<div onclick="evil()">ok</div>')).not.toContain('onclick')
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/lib/text-formatting-utils.test.ts`
Expected: 14 tests pass

**Step 3: Commit**

```bash
git add src/lib/text-formatting-utils.test.ts
git commit -m "test: add text formatting utility and sanitization tests"
```

---

### Task 3: Streak Calculation Tests

**Files:**

- Create: `src/lib/streaks.test.ts`
- Source: `src/lib/streaks.ts` (152 lines)

**Context:**
`getISOWeekKey(date)` returns ISO week string like "2024-W03". `calculateStreakFromDates(dates)` takes an array of completed_at strings and computes current/longest streak by ISO week. `getAchievedMilestone(weeks)` returns the highest streak milestone. `getStreakData(coupleId, supabase)` is a thin async wrapper that fetches dates then calls calculateStreakFromDates.

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { getISOWeekKey, calculateStreakFromDates, getAchievedMilestone, getStreakData } from './streaks'

describe('getISOWeekKey', () => {
  it('returns correct ISO week for a known date', () => {
    // 2025-01-06 is Monday of ISO week 2
    expect(getISOWeekKey(new Date('2025-01-06'))).toBe('2025-W02')
  })

  it('handles year boundary correctly', () => {
    // 2024-12-30 is Monday of ISO week 1 of 2025
    expect(getISOWeekKey(new Date('2024-12-30'))).toBe('2025-W01')
  })
})

describe('calculateStreakFromDates', () => {
  it('returns zeros for empty dates', () => {
    const result = calculateStreakFromDates([])
    expect(result).toEqual({ currentStreak: 0, longestStreak: 0, lastCheckInDate: null, totalCheckIns: 0 })
  })

  it('counts total check-ins', () => {
    const dates = ['2025-06-01T12:00:00Z', '2025-06-02T12:00:00Z', '2025-06-08T12:00:00Z']
    const result = calculateStreakFromDates(dates)
    expect(result.totalCheckIns).toBe(3)
  })

  it('returns lastCheckInDate as most recent date', () => {
    const dates = ['2025-01-01T12:00:00Z', '2025-06-15T12:00:00Z']
    const result = calculateStreakFromDates(dates)
    expect(result.lastCheckInDate).toBe('2025-06-15T12:00:00Z')
  })

  it('calculates streak of 1 for single date', () => {
    const result = calculateStreakFromDates(['2025-06-01T12:00:00Z'])
    expect(result.currentStreak).toBeGreaterThanOrEqual(1)
    expect(result.longestStreak).toBeGreaterThanOrEqual(1)
  })
})

describe('getAchievedMilestone', () => {
  it('returns null for streak below 4 weeks', () => {
    expect(getAchievedMilestone(3)).toBeNull()
  })

  it('returns 1 Month milestone at 4 weeks', () => {
    const result = getAchievedMilestone(4)
    expect(result).not.toBeNull()
    expect(result!.label).toBe('1 Month')
  })

  it('returns 1 Year milestone at 52 weeks', () => {
    const result = getAchievedMilestone(52)
    expect(result!.label).toBe('1 Year')
  })
})

describe('getStreakData', () => {
  it('returns empty streak on query error', async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: null, error: { message: 'fail' } }),
              }),
            }),
          }),
        }),
      }),
    } as never
    const result = await getStreakData('c1', supabase)
    expect(result.currentStreak).toBe(0)
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/lib/streaks.test.ts`
Expected: 8 tests pass

**Step 3: Commit**

```bash
git add src/lib/streaks.test.ts
git commit -m "test: add streak calculation unit tests"
```

---

### Task 4: Growth Scoring Tests

**Files:**

- Create: `src/lib/growth-scoring.test.ts`
- Source: `src/lib/growth-scoring.ts` (141 lines)

**Context:**
`computeScore(metrics)` is a pure function that takes `[{actual, max, weight}]` and returns a weighted score 0-100. `calculateGrowthScores(coupleId, supabase)` queries 13 counts across 6 tables and returns 5 `GrowthAreaScore` objects with area, label, score, and color.

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { computeScore, calculateGrowthScores } from './growth-scoring'

describe('computeScore', () => {
  it('returns 0 for all zeros', () => {
    expect(computeScore([{ actual: 0, max: 10, weight: 100 }])).toBe(0)
  })

  it('returns 100 when all metrics are at max', () => {
    expect(
      computeScore([
        { actual: 10, max: 10, weight: 50 },
        { actual: 5, max: 5, weight: 50 },
      ]),
    ).toBe(100)
  })

  it('caps individual metric ratios at 1.0', () => {
    // actual exceeds max — should still cap at weight contribution
    expect(computeScore([{ actual: 20, max: 10, weight: 100 }])).toBe(100)
  })

  it('calculates weighted partial scores', () => {
    // 5/10 * 60 + 3/5 * 40 = 30 + 24 = 54
    expect(
      computeScore([
        { actual: 5, max: 10, weight: 60 },
        { actual: 3, max: 5, weight: 40 },
      ]),
    ).toBe(54)
  })
})

describe('calculateGrowthScores', () => {
  it('returns 5 growth area scores', async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 0 }),
            not: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                filter: vi.fn().mockResolvedValue({ count: 0 }),
              }),
            }),
          }),
        }),
      }),
    } as never
    const result = await calculateGrowthScores('c1', supabase)
    expect(result).toHaveLength(5)
    expect(result.map((r) => r.area)).toEqual([
      'communication',
      'emotional-connection',
      'conflict-resolution',
      'future-planning',
      'intimacy',
    ])
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/lib/growth-scoring.test.ts`
Expected: 5 tests pass

**Step 3: Commit**

```bash
git add src/lib/growth-scoring.test.ts
git commit -m "test: add growth scoring unit tests"
```

---

## Summary

| Task      | File                                    | Tests  | Focus                              |
| --------- | --------------------------------------- | ------ | ---------------------------------- |
| 1         | `src/lib/text-formatting.test.ts`       | 9      | applyFormat + removeFormat         |
| 2         | `src/lib/text-formatting-utils.test.ts` | 14     | toHTML, counts, validate, sanitize |
| 3         | `src/lib/streaks.test.ts`               | 8      | ISO weeks, streak calc, milestones |
| 4         | `src/lib/growth-scoring.test.ts`        | 5      | computeScore + growth areas        |
| **Total** | **4 new files**                         | **36** |                                    |

Expected test count after Sprint 8: **~591 tests** (555 + 36)
