/**
 * Haptic feedback utilities for web applications
 * Provides consistent haptic feedback patterns across the application
 */

export type HapticIntensity = 'light' | 'medium' | 'heavy'

/**
 * Haptic feedback patterns for different interaction types
 */
export const HAPTIC_PATTERNS = {
  // Basic interaction patterns
  light: 10,
  medium: 50,
  heavy: 100,

  // Specific interaction patterns
  tap: 10,
  select: 25,
  toggle: 40,
  success: [50, 50, 50] as number[],
  warning: [100, 50, 100] as number[],
  error: [150, 100, 150, 100, 150] as number[],

  // UI feedback patterns
  swipe: 15,
  longPress: [50, 100] as number[],
  notification: [25, 50, 25] as number[],

  // Custom patterns for QC app
  checkInComplete: [100, 50, 100, 50, 200] as number[],
  milestoneReached: [100, 100, 100, 100, 100] as number[],
  noteAdded: 30,
  dailyGratitude: [50, 50, 100] as number[],
} as const

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator && typeof navigator.vibrate === 'function'
}

/**
 * Trigger haptic feedback with specified intensity
 */
export function triggerHaptic(intensity: HapticIntensity): void {
  if (!isHapticSupported()) {
    return
  }

  // eslint-disable-next-line security/detect-object-injection -- intensity is typed as HapticIntensity ('light' | 'medium' | 'heavy')
  const pattern = HAPTIC_PATTERNS[intensity]
  navigator.vibrate(pattern)
}

/**
 * Trigger haptic feedback with a custom pattern
 */
export function triggerHapticPattern(pattern: number | number[]): void {
  if (!isHapticSupported()) {
    return
  }

  navigator.vibrate(pattern)
}

/**
 * Predefined haptic functions for common interactions
 */
export const hapticFeedback = {
  /** Light tap feedback for buttons and links */
  tap: () => triggerHapticPattern(HAPTIC_PATTERNS.tap),

  /** Selection feedback for choices and toggles */
  select: () => triggerHapticPattern(HAPTIC_PATTERNS.select),

  /** Toggle feedback for switches and checkboxes */
  toggle: () => triggerHapticPattern(HAPTIC_PATTERNS.toggle),

  /** Success feedback for completed actions */
  success: () => triggerHapticPattern(HAPTIC_PATTERNS.success),

  /** Warning feedback for caution states */
  warning: () => triggerHapticPattern(HAPTIC_PATTERNS.warning),

  /** Error feedback for failed actions */
  error: () => triggerHapticPattern(HAPTIC_PATTERNS.error),

  /** Swipe feedback for gesture interactions */
  swipe: () => triggerHapticPattern(HAPTIC_PATTERNS.swipe),

  /** Long press feedback for context menus */
  longPress: () => triggerHapticPattern(HAPTIC_PATTERNS.longPress),

  /** Notification feedback for alerts */
  notification: () => triggerHapticPattern(HAPTIC_PATTERNS.notification),

  /** QC-specific: Check-in completion celebration */
  checkInComplete: () => triggerHapticPattern(HAPTIC_PATTERNS.checkInComplete),

  /** QC-specific: Milestone achievement celebration */
  milestoneReached: () => triggerHapticPattern(HAPTIC_PATTERNS.milestoneReached),

  /** QC-specific: Note added confirmation */
  noteAdded: () => triggerHapticPattern(HAPTIC_PATTERNS.noteAdded),

  /** QC-specific: Daily gratitude moment */
  dailyGratitude: () => triggerHapticPattern(HAPTIC_PATTERNS.dailyGratitude),
}

/**
 * Hook for using haptic feedback in React components
 */
export function useHapticFeedback() {
  return {
    isSupported: isHapticSupported(),
    trigger: triggerHaptic,
    triggerPattern: triggerHapticPattern,
    feedback: hapticFeedback,
  }
}

/**
 * Higher-order function to add haptic feedback to event handlers
 */
export function withHaptic<T extends (...args: unknown[]) => unknown>(
  handler: T,
  intensity: HapticIntensity = 'light',
) {
  return (...args: Parameters<T>): ReturnType<T> => {
    triggerHaptic(intensity)
    return handler(...args) as ReturnType<T>
  }
}

/**
 * Utility to create haptic-enabled event handlers
 */
export function createHapticHandler<T extends Event>(
  handler: (event: T) => void,
  intensity: HapticIntensity = 'light',
) {
  return (event: T) => {
    triggerHaptic(intensity)
    handler(event)
  }
}

export default hapticFeedback
