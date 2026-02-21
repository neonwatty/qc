import confetti from 'canvas-confetti'

/**
 * Celebration burst for check-in completion.
 * Fires from both sides of the screen.
 */
export function celebrationBurst(): void {
  const duration = 2000
  const end = Date.now() + duration

  const frame = (): void => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#ec4899', '#a855f7', '#6366f1'],
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#ec4899', '#a855f7', '#6366f1'],
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}

/**
 * Milestone achievement confetti -- big center burst.
 */
export function milestoneConfetti(): void {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#fbbf24', '#f59e0b', '#d97706', '#ec4899', '#a855f7'],
  })
}

/**
 * Streak milestone confetti -- fire emoji themed burst.
 */
export function streakConfetti(): void {
  const defaults = {
    spread: 360,
    ticks: 60,
    gravity: 0,
    decay: 0.96,
    startVelocity: 20,
    colors: ['#ff6b35', '#f7c948', '#ff3e3e', '#ec4899'],
  }

  confetti({
    ...defaults,
    particleCount: 30,
    scalar: 1.2,
    shapes: ['circle'],
    origin: { x: 0.5, y: 0.5 },
  })

  confetti({
    ...defaults,
    particleCount: 20,
    scalar: 0.75,
    shapes: ['square'],
    origin: { x: 0.5, y: 0.5 },
  })
}
