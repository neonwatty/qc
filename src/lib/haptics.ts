/**
 * Haptic feedback utilities with native Capacitor support and web fallback.
 * On iOS (Capacitor), uses the Haptics plugin for real Taptic Engine feedback.
 * On web, falls back to the Vibration API where available.
 *
 * IMPORTANT: @capacitor/haptics is loaded lazily via dynamic import to avoid
 * hanging in non-native environments (e.g. Linux CI). The Capacitor core
 * module calls registerPlugin() at import time, which can block on platforms
 * where the native bridge doesn't exist.
 */

import { isNativePlatform } from '@/lib/capacitor'

export type HapticIntensity = 'light' | 'medium' | 'heavy'

/**
 * Web fallback vibration patterns (ms) for browsers without native haptics
 */
export const HAPTIC_PATTERNS = {
  light: 10,
  medium: 50,
  heavy: 100,

  tap: 10,
  select: 25,
  toggle: 40,
  success: [50, 50, 50] as number[],
  warning: [100, 50, 100] as number[],
  error: [150, 100, 150, 100, 150] as number[],

  swipe: 15,
  longPress: [50, 100] as number[],
  notification: [25, 50, 25] as number[],

  checkInComplete: [100, 50, 100, 50, 200] as number[],
  milestoneReached: [100, 100, 100, 100, 100] as number[],
  noteAdded: 30,
  dailyGratitude: [50, 50, 100] as number[],
} as const

/** Lazily loaded Capacitor Haptics module — only loaded on native platforms */
let hapticsModule: typeof import('@capacitor/haptics') | null = null

async function getHaptics(): Promise<typeof import('@capacitor/haptics') | null> {
  if (hapticsModule) return hapticsModule
  if (!isNativePlatform()) return null
  try {
    hapticsModule = await import('@capacitor/haptics')
    return hapticsModule
  } catch {
    return null
  }
}

/**
 * Check if haptic feedback is supported (native or web vibration)
 */
export function isHapticSupported(): boolean {
  if (isNativePlatform()) return true
  return typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function'
}

/**
 * Trigger haptic feedback with specified intensity.
 * Uses Capacitor Haptics on native, Vibration API on web.
 */
export function triggerHaptic(intensity: HapticIntensity): void {
  if (!isHapticSupported()) return

  if (isNativePlatform()) {
    void getHaptics().then((mod) => {
      if (!mod) return
      const styleMap: Record<HapticIntensity, (typeof mod.ImpactStyle)[keyof typeof mod.ImpactStyle]> = {
        light: mod.ImpactStyle.Light,
        medium: mod.ImpactStyle.Medium,
        heavy: mod.ImpactStyle.Heavy,
      }
      // eslint-disable-next-line security/detect-object-injection -- intensity is typed as HapticIntensity
      void mod.Haptics.impact({ style: styleMap[intensity] })
    })
    return
  }

  // eslint-disable-next-line security/detect-object-injection -- intensity is typed as HapticIntensity ('light' | 'medium' | 'heavy')
  const pattern = HAPTIC_PATTERNS[intensity]
  navigator.vibrate(pattern)
}

/**
 * Trigger haptic feedback with a custom pattern.
 * On native, uses a single medium impact (patterns aren't supported natively).
 */
export function triggerHapticPattern(pattern: number | number[]): void {
  if (!isHapticSupported()) return

  if (isNativePlatform()) {
    void getHaptics().then((mod) => {
      if (!mod) return
      void mod.Haptics.impact({ style: mod.ImpactStyle.Medium })
    })
    return
  }

  navigator.vibrate(pattern)
}

/**
 * Trigger a native notification haptic (success/warning/error).
 * Falls back to vibration pattern on web.
 */
function triggerNotification(type: 'success' | 'warning' | 'error'): void {
  if (!isHapticSupported()) return

  if (isNativePlatform()) {
    void getHaptics().then((mod) => {
      if (!mod) return
      const typeMap: Record<string, (typeof mod.NotificationType)[keyof typeof mod.NotificationType]> = {
        success: mod.NotificationType.Success,
        warning: mod.NotificationType.Warning,
        error: mod.NotificationType.Error,
      }
      // eslint-disable-next-line security/detect-object-injection -- type is constrained to 'success' | 'warning' | 'error'
      void mod.Haptics.notification({ type: typeMap[type] })
    })
    return
  }

  // eslint-disable-next-line security/detect-object-injection -- type is constrained to 'success' | 'warning' | 'error'
  const pattern = HAPTIC_PATTERNS[type]
  navigator.vibrate(pattern)
}

/**
 * Predefined haptic functions for common interactions
 */
export const hapticFeedback = {
  /** Light tap feedback for buttons and links */
  tap: () => triggerHaptic('light'),

  /** Selection feedback for choices and toggles */
  select: () => triggerHaptic('light'),

  /** Toggle feedback for switches and checkboxes */
  toggle: () => triggerHaptic('medium'),

  /** Success feedback for completed actions */
  success: () => triggerNotification('success'),

  /** Warning feedback for caution states */
  warning: () => triggerNotification('warning'),

  /** Error feedback for failed actions */
  error: () => triggerNotification('error'),

  /** Swipe feedback for gesture interactions */
  swipe: () => triggerHaptic('light'),

  /** Long press feedback for context menus */
  longPress: () => triggerHaptic('heavy'),

  /** Notification feedback for alerts */
  notification: () => triggerNotification('success'),

  /** QC-specific: Check-in completion celebration */
  checkInComplete: () => triggerNotification('success'),

  /** QC-specific: Milestone achievement celebration */
  milestoneReached: () => triggerNotification('success'),

  /** QC-specific: Note added confirmation */
  noteAdded: () => triggerHaptic('light'),

  /** QC-specific: Daily gratitude moment */
  dailyGratitude: () => triggerNotification('success'),
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
