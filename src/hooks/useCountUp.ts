'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Animated count-up hook. Counts from 0 to target over duration ms.
 */
export function useCountUp(target: number, duration: number = 1000): number {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    // Cancel any in-flight animation
    cancelAnimationFrame(rafRef.current)

    const startTime = performance.now()

    function update(currentTime: number): void {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(update)
      }
    }

    // Always schedule via rAF -- for target 0 the first frame sets value to 0
    rafRef.current = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return value
}
