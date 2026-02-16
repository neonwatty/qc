'use client'

import * as React from 'react'

import { hapticFeedback } from '@/lib/haptics'

export function useSwipeGestures(options?: {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}) {
  const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50 } = options || {}

  const touchStart = React.useRef<{ x: number; y: number } | null>(null)
  const touchEnd = React.useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    }
  }

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return

    const distanceX = touchStart.current.x - touchEnd.current.x
    const distanceY = touchStart.current.y - touchEnd.current.y
    const isLeftSwipe = distanceX > threshold
    const isRightSwipe = distanceX < -threshold
    const isUpSwipe = distanceY > threshold
    const isDownSwipe = distanceY < -threshold

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && onSwipeLeft) {
        hapticFeedback.swipe()
        onSwipeLeft()
      }
      if (isRightSwipe && onSwipeRight) {
        hapticFeedback.swipe()
        onSwipeRight()
      }
    } else {
      if (isUpSwipe && onSwipeUp) {
        hapticFeedback.swipe()
        onSwipeUp()
      }
      if (isDownSwipe && onSwipeDown) {
        hapticFeedback.swipe()
        onSwipeDown()
      }
    }
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
