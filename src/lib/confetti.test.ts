import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockConfetti = vi.fn()

vi.mock('canvas-confetti', () => ({
  default: mockConfetti,
}))

beforeEach(() => {
  vi.useFakeTimers()
  mockConfetti.mockClear()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('celebrationBurst', () => {
  it('fires confetti from both left and right on first frame', async () => {
    const { celebrationBurst } = await import('./confetti')
    vi.stubGlobal('requestAnimationFrame', vi.fn())

    await celebrationBurst()

    expect(mockConfetti).toHaveBeenCalledTimes(2)
    expect(mockConfetti).toHaveBeenCalledWith(expect.objectContaining({ angle: 60, origin: { x: 0, y: 0.6 } }))
    expect(mockConfetti).toHaveBeenCalledWith(expect.objectContaining({ angle: 120, origin: { x: 1, y: 0.6 } }))
  })

  it('schedules requestAnimationFrame while within duration', async () => {
    const { celebrationBurst } = await import('./confetti')
    const rAF = vi.fn()
    vi.stubGlobal('requestAnimationFrame', rAF)

    await celebrationBurst()

    expect(rAF).toHaveBeenCalledTimes(1)
  })

  it('uses pink/purple/indigo color palette', async () => {
    const { celebrationBurst } = await import('./confetti')
    vi.stubGlobal('requestAnimationFrame', vi.fn())

    await celebrationBurst()

    expect(mockConfetti).toHaveBeenCalledWith(expect.objectContaining({ colors: ['#ec4899', '#a855f7', '#6366f1'] }))
  })
})

describe('milestoneConfetti', () => {
  it('fires a single burst with 100 particles', async () => {
    const { milestoneConfetti } = await import('./confetti')
    await milestoneConfetti()

    expect(mockConfetti).toHaveBeenCalledTimes(1)
    expect(mockConfetti).toHaveBeenCalledWith(
      expect.objectContaining({ particleCount: 100, spread: 70, origin: { y: 0.6 } }),
    )
  })

  it('uses gold/amber/pink/purple color palette', async () => {
    const { milestoneConfetti } = await import('./confetti')
    await milestoneConfetti()

    expect(mockConfetti).toHaveBeenCalledWith(
      expect.objectContaining({ colors: ['#fbbf24', '#f59e0b', '#d97706', '#ec4899', '#a855f7'] }),
    )
  })
})

describe('streakConfetti', () => {
  it('fires two bursts with circle and square shapes', async () => {
    const { streakConfetti } = await import('./confetti')
    await streakConfetti()

    expect(mockConfetti).toHaveBeenCalledTimes(2)
    expect(mockConfetti).toHaveBeenCalledWith(expect.objectContaining({ particleCount: 30, shapes: ['circle'] }))
    expect(mockConfetti).toHaveBeenCalledWith(expect.objectContaining({ particleCount: 20, shapes: ['square'] }))
  })

  it('uses zero gravity and 360-degree spread', async () => {
    const { streakConfetti } = await import('./confetti')
    await streakConfetti()

    expect(mockConfetti).toHaveBeenCalledWith(expect.objectContaining({ gravity: 0, spread: 360, decay: 0.96 }))
  })

  it('fires from center', async () => {
    const { streakConfetti } = await import('./confetti')
    await streakConfetti()

    expect(mockConfetti).toHaveBeenCalledWith(expect.objectContaining({ origin: { x: 0.5, y: 0.5 } }))
  })
})
