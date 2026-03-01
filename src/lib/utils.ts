import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

/** @public */
export function snakeToCamelObject<T extends Record<string, unknown>>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value
  }

  return result as T
}

/** @public */
export function camelToSnakeObject<T extends Record<string, unknown>>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value
  }

  return result as T
}

/**
 * Sanitize database/service error messages to prevent leaking internal details.
 * Logs the original error for debugging, returns a generic message for the client.
 */
export function sanitizeDbError(error: { message: string }, context?: string): string {
  if (context) {
    console.error(`[${context}]`, error.message)
  }
  return 'Something went wrong. Please try again.'
}
