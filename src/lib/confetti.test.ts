import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockConfetti = vi.fn()

vi.mock('canvas-confetti', () => ({
  default: mockConfetti,
}))

describe('confetti', () => {
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

      const rAFCallbacks: FrameRequestCallback[] = []
      vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn((cb: FrameRequestCallback) => {
          rAFCallbacks.push(cb)
          return rAFCallbacks.length
        }),
      )

      celebrationBurst()

      expect(mockConfetti).toHaveBeenCalledTimes(2)
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
        }),
      )
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
        }),
      )
    })

    it('schedules requestAnimationFrame while within duration', async () => {
      const { celebrationBurst } = await import('./confetti')

      const rAFCallbacks: FrameRequestCallback[] = []
      vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn((cb: FrameRequestCallback) => {
          rAFCallbacks.push(cb)
          return rAFCallbacks.length
        }),
      )

      celebrationBurst()

      // First frame fires immediately, schedules rAF since Date.now() < end
      expect(rAFCallbacks).toHaveLength(1)
    })

    it('stops scheduling after duration elapses', async () => {
      const { celebrationBurst } = await import('./confetti')

      const rAFCallbacks: FrameRequestCallback[] = []
      vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn((cb: FrameRequestCallback) => {
          rAFCallbacks.push(cb)
          return rAFCallbacks.length
        }),
      )

      celebrationBurst()
      mockConfetti.mockClear()

      // Advance past the 2-second duration
      vi.advanceTimersByTime(2100)

      // Execute the queued rAF callback after time has passed
      if (rAFCallbacks.length > 0) {
        rAFCallbacks[rAFCallbacks.length - 1](performance.now())
      }

      // It should have fired confetti but NOT scheduled another rAF
      const rAFMock = globalThis.requestAnimationFrame as ReturnType<typeof vi.fn>
      const callCountAfterExpiry = rAFMock.mock.calls.length
      expect(callCountAfterExpiry).toBe(1) // Only the one from the initial frame()
    })

    it('uses pink/purple/indigo color palette', async () => {
      const { celebrationBurst } = await import('./confetti')

      vi.stubGlobal('requestAnimationFrame', vi.fn())

      celebrationBurst()

      const expectedColors = ['#ec4899', '#a855f7', '#6366f1']
      expect(mockConfetti).toHaveBeenCalledWith(expect.objectContaining({ colors: expectedColors }))
    })
  })

  describe('milestoneConfetti', () => {
    it('fires a single burst with 100 particles', async () => {
      const { milestoneConfetti } = await import('./confetti')

      milestoneConfetti()

      expect(mockConfetti).toHaveBeenCalledTimes(1)
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        }),
      )
    })

    it('uses gold/amber/pink/purple color palette', async () => {
      const { milestoneConfetti } = await import('./confetti')

      milestoneConfetti()

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#ec4899', '#a855f7'],
        }),
      )
    })
  })

  describe('streakConfetti', () => {
    it('fires two bursts with circle and square shapes', async () => {
      const { streakConfetti } = await import('./confetti')

      streakConfetti()

      expect(mockConfetti).toHaveBeenCalledTimes(2)
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 30,
          shapes: ['circle'],
          origin: { x: 0.5, y: 0.5 },
        }),
      )
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 20,
          shapes: ['square'],
          origin: { x: 0.5, y: 0.5 },
        }),
      )
    })

    it('uses zero gravity and 360-degree spread', async () => {
      const { streakConfetti } = await import('./confetti')

      streakConfetti()

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          gravity: 0,
          spread: 360,
          ticks: 60,
          decay: 0.96,
          startVelocity: 20,
        }),
      )
    })

    it('uses different scalar values for each burst', async () => {
      const { streakConfetti } = await import('./confetti')

      streakConfetti()

      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          shapes: ['circle'],
          scalar: 1.2,
        }),
      )
      expect(mockConfetti).toHaveBeenCalledWith(
        expect.objectContaining({
          shapes: ['square'],
          scalar: 0.75,
        }),
      )
    })
  })
})
