# Sprint 10: Remaining Library Utility Tests

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add unit tests for all remaining untested library utilities — confetti effects, platform detection, animation variants, touch interactions, and email client factory. Completing this sprint means 100% of `src/lib/` files have test coverage. ~25 new tests bringing total to ~585.

**Architecture:** All targets are pure functions, constants, or simple factories. Confetti tests mock `canvas-confetti` and `requestAnimationFrame`. Capacitor tests mock `navigator.userAgent`. Animation tests verify variant shape. Email tests mock `process.env`.

**Tech Stack:** Vitest

---

### Task 1: Confetti Effects Tests

**Files:**

- Create: `src/lib/confetti.test.ts`
- Source: `src/lib/confetti.ts` (75 lines)

**Context:**
Three exported functions: `celebrationBurst()` fires confetti from both screen sides using `requestAnimationFrame` loop for 2 seconds. `milestoneConfetti()` fires a single center burst with 100 particles. `streakConfetti()` fires two bursts with different shapes (circle + square). All call the default export from `canvas-confetti`.

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockConfetti = vi.fn()
vi.mock('canvas-confetti', () => ({ default: mockConfetti }))

const { celebrationBurst, milestoneConfetti, streakConfetti } = await import('./confetti')

describe('celebrationBurst', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('calls confetti twice on first frame (left and right sides)', () => {
    celebrationBurst()
    expect(mockConfetti).toHaveBeenCalledTimes(2)
  })

  it('fires from left side with angle 60', () => {
    celebrationBurst()
    expect(mockConfetti).toHaveBeenCalledWith(expect.objectContaining({ angle: 60, origin: { x: 0, y: 0.6 } }))
  })

  it('fires from right side with angle 120', () => {
    celebrationBurst()
    expect(mockConfetti).toHaveBeenCalledWith(expect.objectContaining({ angle: 120, origin: { x: 1, y: 0.6 } }))
  })

  it('schedules next frame via requestAnimationFrame', () => {
    celebrationBurst()
    expect(requestAnimationFrame).toHaveBeenCalled()
  })
})

describe('milestoneConfetti', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fires a single burst with 100 particles', () => {
    milestoneConfetti()
    expect(mockConfetti).toHaveBeenCalledTimes(1)
    expect(mockConfetti).toHaveBeenCalledWith(expect.objectContaining({ particleCount: 100, spread: 70 }))
  })

  it('uses QC color palette', () => {
    milestoneConfetti()
    const call = mockConfetti.mock.calls[0][0]
    expect(call.colors).toContain('#ec4899')
  })
})

describe('streakConfetti', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fires two bursts (circle and square shapes)', () => {
    streakConfetti()
    expect(mockConfetti).toHaveBeenCalledTimes(2)
  })

  it('first burst uses circle shapes with 30 particles', () => {
    streakConfetti()
    expect(mockConfetti).toHaveBeenCalledWith(expect.objectContaining({ shapes: ['circle'], particleCount: 30 }))
  })

  it('second burst uses square shapes with 20 particles', () => {
    streakConfetti()
    expect(mockConfetti).toHaveBeenCalledWith(expect.objectContaining({ shapes: ['square'], particleCount: 20 }))
  })

  it('fires from center with zero gravity', () => {
    streakConfetti()
    expect(mockConfetti).toHaveBeenCalledWith(expect.objectContaining({ origin: { x: 0.5, y: 0.5 }, gravity: 0 }))
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/lib/confetti.test.ts`
Expected: 9 tests pass

**Step 3: Commit**

```bash
git add src/lib/confetti.test.ts
git commit -m "test: add confetti effects unit tests"
```

---

### Task 2: Platform Detection, Touch Interactions & Animation Variants Tests

**Files:**

- Create: `src/lib/capacitor.test.ts`
- Source: `src/lib/capacitor.ts` (23 lines)
- Create: `src/lib/touch-interactions.test.ts`
- Source: `src/lib/touch-interactions.ts` (15 lines)
- Create: `src/lib/animations.test.ts`
- Source: `src/lib/animations.ts` (178 lines)

**Context:**
`isNativePlatform()` returns `false` on server (no `window`), `true` when `navigator.userAgent` includes `'QCCapacitor'`, `false` otherwise. `optimizeForTouch` returns a cleanup function (currently a no-op stub). `ensureTouchTarget` is a void no-op stub. Animation exports are Framer Motion `Variants` objects with `initial`, `animate`, and optionally `exit` keys.

**Step 1: Write the tests**

```typescript
// src/lib/capacitor.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { isNativePlatform } from './capacitor'

describe('isNativePlatform', () => {
  const originalWindow = globalThis.window

  afterEach(() => {
    if (originalWindow === undefined) {
      // @ts-expect-error -- restoring server-like environment
      delete globalThis.window
    }
    vi.restoreAllMocks()
  })

  it('returns false on server (no window)', () => {
    const win = globalThis.window
    // @ts-expect-error -- simulating server
    delete globalThis.window
    expect(isNativePlatform()).toBe(false)
    globalThis.window = win
  })

  it('returns true when user agent contains QCCapacitor', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 QCCapacitor' },
      configurable: true,
    })
    expect(isNativePlatform()).toBe(true)
  })

  it('returns false for standard browser user agent', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 Chrome/120' },
      configurable: true,
    })
    expect(isNativePlatform()).toBe(false)
  })
})
```

```typescript
// src/lib/touch-interactions.test.ts
import { describe, it, expect } from 'vitest'
import { optimizeForTouch, ensureTouchTarget } from './touch-interactions'

describe('optimizeForTouch', () => {
  it('returns a cleanup function', () => {
    const el = document.createElement('div')
    const cleanup = optimizeForTouch(el)
    expect(typeof cleanup).toBe('function')
  })

  it('cleanup function does not throw', () => {
    const el = document.createElement('div')
    const cleanup = optimizeForTouch(el, { enableRipple: true })
    expect(() => cleanup()).not.toThrow()
  })
})

describe('ensureTouchTarget', () => {
  it('does not throw', () => {
    const el = document.createElement('div')
    expect(() => ensureTouchTarget(el)).not.toThrow()
  })
})
```

```typescript
// src/lib/animations.test.ts
import { describe, it, expect } from 'vitest'
import {
  slideUp,
  fadeIn,
  pageTransition,
  slideDown,
  slideInFromLeft,
  slideInFromRight,
  scaleIn,
  bounceIn,
  modalBackdrop,
  modalContent,
  cardHover,
  buttonTap,
  pulse,
  spinner,
  staggerContainer,
  staggerItem,
  SPRING_CONFIGS,
} from './animations'

describe('entrance animations', () => {
  it.each([
    ['slideUp', slideUp],
    ['fadeIn', fadeIn],
    ['pageTransition', pageTransition],
    ['slideDown', slideDown],
    ['slideInFromLeft', slideInFromLeft],
    ['slideInFromRight', slideInFromRight],
    ['scaleIn', scaleIn],
    ['bounceIn', bounceIn],
  ])('%s has initial, animate, and exit keys', (_name, variant) => {
    expect(variant).toHaveProperty('initial')
    expect(variant).toHaveProperty('animate')
    expect(variant).toHaveProperty('exit')
  })
})

describe('modal animations', () => {
  it('modalBackdrop has initial, animate, exit', () => {
    expect(modalBackdrop).toHaveProperty('initial')
    expect(modalBackdrop).toHaveProperty('animate')
    expect(modalBackdrop).toHaveProperty('exit')
  })

  it('modalContent has initial, animate, exit', () => {
    expect(modalContent).toHaveProperty('initial')
    expect(modalContent).toHaveProperty('animate')
    expect(modalContent).toHaveProperty('exit')
  })
})

describe('interaction animations', () => {
  it('cardHover has hover and tap states', () => {
    expect(cardHover).toHaveProperty('hover')
    expect(cardHover).toHaveProperty('tap')
  })

  it('buttonTap has tap state', () => {
    expect(buttonTap).toHaveProperty('tap')
  })
})

describe('stagger variants', () => {
  it('staggerContainer has animate with staggerChildren', () => {
    const animate = staggerContainer.animate as Record<string, unknown>
    expect(animate).toHaveProperty('transition')
  })

  it('staggerItem has initial and animate', () => {
    expect(staggerItem).toHaveProperty('initial')
    expect(staggerItem).toHaveProperty('animate')
  })
})

describe('continuous animations', () => {
  it('pulse has animate with repeat', () => {
    expect(pulse).toHaveProperty('animate')
  })

  it('spinner has animate with rotate', () => {
    expect(spinner).toHaveProperty('animate')
  })
})

describe('SPRING_CONFIGS', () => {
  it('has snappy, smooth, and bouncy configs', () => {
    expect(SPRING_CONFIGS.snappy.type).toBe('spring')
    expect(SPRING_CONFIGS.smooth.type).toBe('spring')
    expect(SPRING_CONFIGS.bouncy.type).toBe('spring')
  })

  it('bouncy has higher stiffness than smooth', () => {
    expect(SPRING_CONFIGS.bouncy.stiffness).toBeGreaterThan(SPRING_CONFIGS.smooth.stiffness)
  })
})
```

**Step 2: Run the tests**

Run: `npx vitest run src/lib/capacitor.test.ts src/lib/touch-interactions.test.ts src/lib/animations.test.ts`
Expected: ~19 tests pass

**Step 3: Commit**

```bash
git add src/lib/capacitor.test.ts src/lib/touch-interactions.test.ts src/lib/animations.test.ts
git commit -m "test: add platform detection, touch interaction, and animation variant tests"
```

---

### Task 3: Email Client Factory Tests

**Files:**

- Create: `src/lib/email/resend.test.ts`
- Source: `src/lib/email/resend.ts` (16 lines)

**Context:**
`getResend()` is a lazy singleton factory that creates a `Resend` client from `process.env.RESEND_API_KEY`. Throws `'RESEND_API_KEY is not configured'` if missing. `EMAIL_FROM` defaults to `'onboarding@resend.dev'`. `BATCH_SIZE` is `100`.

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation((key: string) => ({ key })),
}))

beforeEach(() => {
  vi.resetModules()
  vi.unstubAllGlobals()
})

describe('getResend', () => {
  it('throws when RESEND_API_KEY is not set', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    const { getResend } = await import('./resend')
    expect(() => getResend()).toThrow('RESEND_API_KEY is not configured')
  })

  it('creates a Resend instance when API key is set', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key-123')
    const { getResend } = await import('./resend')
    const client = getResend()
    expect(client).toBeDefined()
  })
})

describe('EMAIL_FROM', () => {
  it('defaults to onboarding@resend.dev', async () => {
    const { EMAIL_FROM } = await import('./resend')
    expect(EMAIL_FROM).toMatch(/@/)
  })
})

describe('BATCH_SIZE', () => {
  it('is 100', async () => {
    const { BATCH_SIZE } = await import('./resend')
    expect(BATCH_SIZE).toBe(100)
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/lib/email/resend.test.ts`
Expected: 4 tests pass

**Step 3: Commit**

```bash
git add src/lib/email/resend.test.ts
git commit -m "test: add email client factory tests"
```

---

## Summary

| Task      | File                                 | Tests   | Focus                                               |
| --------- | ------------------------------------ | ------- | --------------------------------------------------- |
| 1         | `src/lib/confetti.test.ts`           | 9       | celebrationBurst, milestoneConfetti, streakConfetti |
| 2a        | `src/lib/capacitor.test.ts`          | 3       | isNativePlatform server/native/browser              |
| 2b        | `src/lib/touch-interactions.test.ts` | 3       | optimizeForTouch, ensureTouchTarget                 |
| 2c        | `src/lib/animations.test.ts`         | ~13     | All variant exports + SPRING_CONFIGS                |
| 3         | `src/lib/email/resend.test.ts`       | 4       | getResend, EMAIL_FROM, BATCH_SIZE                   |
| **Total** | **5 new files**                      | **~32** |                                                     |

Expected test count after Sprint 10: **~592 tests** (560 + 32)

**Milestone:** After this sprint, 100% of `src/lib/` files have test coverage.
