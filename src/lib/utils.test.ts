import { describe, it, expect } from 'vitest'

import { cn, snakeToCamel, camelToSnake, snakeToCamelObject, camelToSnakeObject } from './utils'

// ---------------------------------------------------------------------------
// cn
// ---------------------------------------------------------------------------

describe('cn', () => {
  it('merges multiple class strings', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('handles conditional classes', () => {
    const isHidden = false
    expect(cn('base', isHidden && 'hidden', 'visible')).toBe('base visible')
  })

  it('handles undefined and null inputs', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })

  it('resolves tailwind conflicts by keeping the last value', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('merges responsive and state variants correctly', () => {
    expect(cn('hover:bg-red-500', 'hover:bg-blue-500')).toBe('hover:bg-blue-500')
  })

  it('returns an empty string for no inputs', () => {
    expect(cn()).toBe('')
  })
})

// ---------------------------------------------------------------------------
// snakeToCamel
// ---------------------------------------------------------------------------

describe('snakeToCamel', () => {
  it('converts basic snake_case to camelCase', () => {
    expect(snakeToCamel('hello_world')).toBe('helloWorld')
  })

  it('handles multiple underscores', () => {
    expect(snakeToCamel('one_two_three_four')).toBe('oneTwoThreeFour')
  })

  it('leaves strings without underscores unchanged', () => {
    expect(snakeToCamel('already')).toBe('already')
  })

  it('converts single-segment trailing underscore patterns', () => {
    expect(snakeToCamel('couple_id')).toBe('coupleId')
  })
})

// ---------------------------------------------------------------------------
// camelToSnake
// ---------------------------------------------------------------------------

describe('camelToSnake', () => {
  it('converts basic camelCase to snake_case', () => {
    expect(camelToSnake('helloWorld')).toBe('hello_world')
  })

  it('handles multiple capital letters', () => {
    expect(camelToSnake('oneTwoThreeFour')).toBe('one_two_three_four')
  })

  it('leaves strings without capitals unchanged', () => {
    expect(camelToSnake('already')).toBe('already')
  })

  it('converts single-field names', () => {
    expect(camelToSnake('coupleId')).toBe('couple_id')
  })
})

// ---------------------------------------------------------------------------
// snakeToCamelObject
// ---------------------------------------------------------------------------

describe('snakeToCamelObject', () => {
  it('converts all keys from snake_case to camelCase', () => {
    const input = { couple_id: '1', display_name: 'Alice', created_at: '2025-01-01' }
    const result = snakeToCamelObject<Record<string, unknown>>(input)
    expect(result).toEqual({ coupleId: '1', displayName: 'Alice', createdAt: '2025-01-01' })
  })

  it('preserves values of all types', () => {
    const input = { str_val: 'text', num_val: 42, bool_val: true, null_val: null, arr_val: [1, 2] }
    const result = snakeToCamelObject<Record<string, unknown>>(input)
    expect(result).toEqual({ strVal: 'text', numVal: 42, boolVal: true, nullVal: null, arrVal: [1, 2] })
  })

  it('handles an empty object', () => {
    expect(snakeToCamelObject({})).toEqual({})
  })

  it('leaves already camelCase keys unchanged', () => {
    const input = { alreadyCamel: 'yes' }
    const result = snakeToCamelObject<Record<string, unknown>>(input)
    expect(result).toEqual({ alreadyCamel: 'yes' })
  })
})

// ---------------------------------------------------------------------------
// camelToSnakeObject
// ---------------------------------------------------------------------------

describe('camelToSnakeObject', () => {
  it('converts all keys from camelCase to snake_case', () => {
    const input = { coupleId: '1', displayName: 'Bob', createdAt: '2025-01-01' }
    const result = camelToSnakeObject<Record<string, unknown>>(input)
    expect(result).toEqual({ couple_id: '1', display_name: 'Bob', created_at: '2025-01-01' })
  })

  it('preserves values of all types', () => {
    const input = { strVal: 'text', numVal: 42, boolVal: false, nullVal: null }
    const result = camelToSnakeObject<Record<string, unknown>>(input)
    expect(result).toEqual({ str_val: 'text', num_val: 42, bool_val: false, null_val: null })
  })

  it('handles an empty object', () => {
    expect(camelToSnakeObject({})).toEqual({})
  })

  it('round-trips with snakeToCamelObject', () => {
    const original = { couple_id: '1', display_name: 'Alice', mood_before: 7 }
    const camel = snakeToCamelObject<Record<string, unknown>>(original)
    const backToSnake = camelToSnakeObject<Record<string, unknown>>(camel)
    expect(backToSnake).toEqual(original)
  })
})
